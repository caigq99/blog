# Flutter 动画效果

Flutter 提供了丰富的动画系统，使开发者能够创建流畅、精美的动画效果。本文档将介绍 Flutter 中的各种动画类型及其实现方法。

## 动画基础概念

在 Flutter 中，动画系统主要由以下几个核心类组成：

- **Animation**：一个抽象类，表示随时间变化的值
- **AnimationController**：控制动画的播放、暂停、重复等
- **Tween**：定义动画起始值和结束值
- **Curve**：定义动画的变化曲线

## 隐式动画

隐式动画是 Flutter 提供的一种简单易用的动画方式，只需要指定起始状态和结束状态，Flutter 会自动处理中间的过渡动画。

### AnimatedContainer

AnimatedContainer 是最常用的隐式动画 Widget，可以为 Container 的各种属性添加动画效果。

```dart
class AnimatedContainerExample extends StatefulWidget {
  @override
  _AnimatedContainerExampleState createState() => _AnimatedContainerExampleState();
}

class _AnimatedContainerExampleState extends State<AnimatedContainerExample> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _expanded = !_expanded;
        });
      },
      child: Center(
        child: AnimatedContainer(
          duration: Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          width: _expanded ? 200 : 100,
          height: _expanded ? 200 : 100,
          decoration: BoxDecoration(
            color: _expanded ? Colors.blue : Colors.red,
            borderRadius: BorderRadius.circular(_expanded ? 100 : 10),
          ),
          child: Center(
            child: Text(
              'Tap me!',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ),
      ),
    );
  }
}
```

### 其他常用隐式动画 Widget

Flutter 提供了许多其他隐式动画 Widget：

- **AnimatedOpacity**：透明度动画
- **AnimatedPadding**：内边距动画
- **AnimatedPositioned**：位置动画（在 Stack 中使用）
- **AnimatedAlign**：对齐方式动画
- **AnimatedDefaultTextStyle**：文本样式动画
- **AnimatedPhysicalModel**：物理模型动画

### TweenAnimationBuilder

TweenAnimationBuilder 是一个通用的隐式动画构建器，可以为任何值创建动画。

```dart
TweenAnimationBuilder<double>(
  tween: Tween<double>(begin: 0, end: 2 * pi),
  duration: Duration(seconds: 2),
  builder: (context, value, child) {
    return Transform.rotate(
      angle: value,
      child: child,
    );
  },
  child: Container(
    width: 100,
    height: 100,
    color: Colors.blue,
    child: Center(
      child: Text('Rotating'),
    ),
  ),
)
```

## 显式动画

显式动画需要手动控制动画的开始、停止和方向。它们通常使用 AnimationController 来控制。

### 基本用法

```dart
class ExplicitAnimationExample extends StatefulWidget {
  @override
  _ExplicitAnimationExampleState createState() => _ExplicitAnimationExampleState();
}

class _ExplicitAnimationExampleState extends State<ExplicitAnimationExample> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    );

    _animation = Tween<double>(begin: 0, end: 200).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.elasticOut,
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Center(
          child: Container(
            width: _animation.value,
            height: _animation.value,
            color: Colors.purple,
            child: child,
          ),
        );
      },
      child: Center(
        child: Text(
          'Growing Box',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}
```

### AnimatedBuilder

AnimatedBuilder 是创建自定义显式动画的常用方式，它可以重建 Widget 树的一部分，而不是整个树。

### FadeTransition

FadeTransition 是一个预定义的动画 Widget，用于创建淡入淡出效果。

```dart
FadeTransition(
  opacity: _animation,
  child: Container(
    width: 200,
    height: 200,
    color: Colors.green,
  ),
)
```

### SlideTransition

SlideTransition 用于创建滑动动画效果。

```dart
SlideTransition(
  position: Tween<Offset>(
    begin: Offset(-1, 0),
    end: Offset.zero,
  ).animate(_controller),
  child: Container(
    width: 200,
    height: 100,
    color: Colors.orange,
    child: Center(
      child: Text('Sliding in'),
    ),
  ),
)
```

## Hero 动画

Hero 动画用于在不同页面之间创建共享元素过渡效果。

```dart
// 在第一个页面
Hero(
  tag: 'imageHero',
  child: GestureDetector(
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => DetailPage()),
      );
    },
    child: Image.network(
      'https://picsum.photos/250?image=9',
      width: 100,
      height: 100,
    ),
  ),
)

// 在第二个页面
class DetailPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Hero(
          tag: 'imageHero',
          child: Image.network('https://picsum.photos/250?image=9'),
        ),
      ),
    );
  }
}
```

## 交错动画

交错动画是指多个动画按照一定的时间顺序依次播放。

```dart
class StaggeredAnimationExample extends StatefulWidget {
  @override
  _StaggeredAnimationExampleState createState() => _StaggeredAnimationExampleState();
}

class _StaggeredAnimationExampleState extends State<StaggeredAnimationExample> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<double> _width;
  late Animation<double> _height;
  late Animation<BorderRadius?> _borderRadius;
  late Animation<Color?> _color;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 3),
      vsync: this,
    );

    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.0, 0.2, curve: Curves.ease),
      ),
    );

    _width = Tween<double>(begin: 50, end: 200).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.2, 0.4, curve: Curves.ease),
      ),
    );

    _height = Tween<double>(begin: 50, end: 200).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.4, 0.6, curve: Curves.ease),
      ),
    );

    _borderRadius = BorderRadiusTween(
      begin: BorderRadius.circular(4),
      end: BorderRadius.circular(75),
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.6, 0.8, curve: Curves.ease),
      ),
    );

    _color = ColorTween(
      begin: Colors.blue,
      end: Colors.red,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.8, 1.0, curve: Curves.ease),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Staggered Animation')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Opacity(
                  opacity: _opacity.value,
                  child: Container(
                    width: _width.value,
                    height: _height.value,
                    decoration: BoxDecoration(
                      color: _color.value,
                      borderRadius: _borderRadius.value,
                    ),
                  ),
                );
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                if (_controller.status == AnimationStatus.completed) {
                  _controller.reverse();
                } else {
                  _controller.forward();
                }
              },
              child: Text('Animate'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 自定义动画

有时候预定义的动画可能无法满足需求，这时可以创建自定义动画。

### 自定义绘制动画

```dart
class CustomPaintAnimation extends StatefulWidget {
  @override
  _CustomPaintAnimationState createState() => _CustomPaintAnimationState();
}

class _CustomPaintAnimationState extends State<CustomPaintAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: CustomPaint(
        painter: CirclePainter(_controller),
        size: Size(300, 300),
      ),
    );
  }
}

class CirclePainter extends CustomPainter {
  final Animation<double> animation;

  CirclePainter(this.animation) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = 100.0 * animation.value;
    final paint = Paint()
      ..color = Colors.blue.withOpacity(1.0 - animation.value)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    canvas.drawCircle(center, radius, paint);
  }

  @override
  bool shouldRepaint(CirclePainter oldDelegate) => true;
}
```

## 总结

Flutter 的动画系统非常强大和灵活，可以创建各种各样的动画效果：

1. **隐式动画**：简单易用，适合单一属性的动画
2. **显式动画**：提供更多控制，适合复杂的动画序列
3. **Hero 动画**：在页面之间创建流畅的过渡效果
4. **交错动画**：创建多步骤、有序的动画序列
5. **自定义动画**：满足特定需求的定制动画

选择合适的动画类型取决于具体需求和复杂度。在实际应用中，合理使用动画可以显著提升用户体验。
