# Flutter 布局与组件

Flutter 提供了丰富的布局和组件系统，使开发者能够创建复杂且美观的用户界面。本文档将介绍 Flutter 中常用的布局 Widget 和组件。

## 常用布局 Widget

### 线性布局

#### Row（水平布局）

Row 将其子 Widget 按照水平方向排列。

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly, // 主轴对齐方式
  crossAxisAlignment: CrossAxisAlignment.center,    // 交叉轴对齐方式
  children: <Widget>[
    Icon(Icons.star, size: 50),
    Icon(Icons.star, size: 50),
    Icon(Icons.star, size: 50),
  ],
)
```

#### Column（垂直布局）

Column 将其子 Widget 按照垂直方向排列。

```dart
Column(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly, // 主轴对齐方式
  crossAxisAlignment: CrossAxisAlignment.center,    // 交叉轴对齐方式
  children: <Widget>[
    Text('第一行'),
    Text('第二行'),
    Text('第三行'),
  ],
)
```

### 弹性布局

#### Expanded

Expanded 可以使子 Widget 填充 Row、Column 或 Flex 在主轴方向上的可用空间。

```dart
Row(
  children: <Widget>[
    Container(width: 100, color: Colors.red),
    Expanded(
      flex: 2, // 弹性系数，默认为1
      child: Container(color: Colors.green),
    ),
    Container(width: 100, color: Colors.blue),
  ],
)
```

#### Flexible

Flexible 与 Expanded 类似，但它不会强制子 Widget 填充所有可用空间。

```dart
Row(
  children: <Widget>[
    Flexible(
      flex: 1,
      child: Container(color: Colors.red),
    ),
    Flexible(
      flex: 2,
      child: Container(color: Colors.green),
    ),
  ],
)
```

### 层叠布局

#### Stack

Stack 允许子 Widget 相互覆盖。

```dart
Stack(
  alignment: Alignment.center, // 未定位子 Widget 的对齐方式
  children: <Widget>[
    Container(
      width: 300,
      height: 300,
      color: Colors.red,
    ),
    Container(
      width: 200,
      height: 200,
      color: Colors.green,
    ),
    Container(
      width: 100,
      height: 100,
      color: Colors.blue,
    ),
  ],
)
```

#### Positioned

Positioned 用于控制 Stack 子 Widget 的位置。

```dart
Stack(
  children: <Widget>[
    Container(
      width: 300,
      height: 300,
      color: Colors.grey,
    ),
    Positioned(
      left: 20,
      top: 20,
      width: 100,
      height: 100,
      child: Container(color: Colors.red),
    ),
    Positioned(
      right: 20,
      bottom: 20,
      width: 100,
      height: 100,
      child: Container(color: Colors.blue),
    ),
  ],
)
```

### 网格布局

#### GridView

GridView 将子 Widget 排列成二维网格。

```dart
GridView.count(
  crossAxisCount: 3, // 横轴子元素数量
  mainAxisSpacing: 10.0, // 主轴间距
  crossAxisSpacing: 10.0, // 横轴间距
  padding: EdgeInsets.all(10.0),
  children: List.generate(9, (index) {
    return Container(
      color: Colors.primaries[index % Colors.primaries.length],
      child: Center(
        child: Text('Item $index'),
      ),
    );
  }),
)
```

## 容器与装饰

### Container

Container 是一个组合 Widget，结合了绘制、定位和尺寸调整功能。

```dart
Container(
  width: 200,
  height: 200,
  margin: EdgeInsets.all(10),
  padding: EdgeInsets.all(20),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(10),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        offset: Offset(0, 2),
        blurRadius: 6.0,
      ),
    ],
  ),
  child: Text(
    'Hello Flutter',
    style: TextStyle(color: Colors.white, fontSize: 20),
  ),
)
```

### BoxDecoration

BoxDecoration 用于装饰 Container。

```dart
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [Colors.blue, Colors.green],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    borderRadius: BorderRadius.circular(10),
    border: Border.all(
      color: Colors.black,
      width: 2,
    ),
  ),
)
```

## 列表与网格

### ListView

ListView 是一个线性滚动列表。

```dart
ListView.builder(
  itemCount: 100,
  itemBuilder: (context, index) {
    return ListTile(
      leading: Icon(Icons.person),
      title: Text('Item $index'),
      subtitle: Text('Description for item $index'),
      trailing: Icon(Icons.arrow_forward_ios),
      onTap: () {
        print('Tapped on item $index');
      },
    );
  },
)
```

### GridView

GridView 是一个二维网格列表。

```dart
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 3,
    mainAxisSpacing: 10,
    crossAxisSpacing: 10,
    childAspectRatio: 1.0,
  ),
  itemCount: 100,
  itemBuilder: (context, index) {
    return Card(
      child: Center(
        child: Text('Item $index'),
      ),
    );
  },
)
```

## 表单与输入控件

### TextField

TextField 是一个文本输入框。

```dart
TextField(
  decoration: InputDecoration(
    labelText: '用户名',
    hintText: '请输入用户名',
    prefixIcon: Icon(Icons.person),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
    ),
  ),
  onChanged: (value) {
    print('输入的内容: $value');
  },
)
```

### Form

Form 用于管理表单状态。

```dart
final _formKey = GlobalKey<FormState>();

Form(
  key: _formKey,
  child: Column(
    children: <Widget>[
      TextFormField(
        decoration: InputDecoration(labelText: '用户名'),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return '请输入用户名';
          }
          return null;
        },
      ),
      TextFormField(
        decoration: InputDecoration(labelText: '密码'),
        obscureText: true,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return '请输入密码';
          }
          if (value.length < 6) {
            return '密码长度不能小于6位';
          }
          return null;
        },
      ),
      ElevatedButton(
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            // 表单验证通过，执行登录逻辑
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('处理数据中...')),
            );
          }
        },
        child: Text('登录'),
      ),
    ],
  ),
)
```

## 自定义 Widget

创建自定义 Widget 是 Flutter 开发中的常见做法，可以封装特定的 UI 逻辑和外观。

```dart
class RoundedButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Color color;
  final double borderRadius;

  const RoundedButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.color = Colors.blue,
    this.borderRadius = 8.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        primary: color,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      ),
      onPressed: onPressed,
      child: Text(
        text,
        style: TextStyle(fontSize: 16),
      ),
    );
  }
}

// 使用自定义 Widget
RoundedButton(
  text: '提交',
  onPressed: () {
    print('按钮被点击');
  },
  color: Colors.green,
  borderRadius: 20.0,
)
```

## 响应式布局

### MediaQuery

MediaQuery 可以获取设备的屏幕尺寸等信息。

```dart
Widget build(BuildContext context) {
  final screenSize = MediaQuery.of(context).size;

  return Container(
    width: screenSize.width * 0.8, // 屏幕宽度的80%
    height: screenSize.height * 0.3, // 屏幕高度的30%
    color: Colors.blue,
    child: Center(
      child: Text(
        '屏幕宽度: ${screenSize.width.toStringAsFixed(2)}\n'
        '屏幕高度: ${screenSize.height.toStringAsFixed(2)}',
        style: TextStyle(color: Colors.white),
      ),
    ),
  );
}
```

### LayoutBuilder

LayoutBuilder 可以根据父 Widget 的约束条件来构建不同的布局。

```dart
LayoutBuilder(
  builder: (BuildContext context, BoxConstraints constraints) {
    if (constraints.maxWidth > 600) {
      // 宽屏布局
      return Row(
        children: [
          Container(
            width: 200,
            color: Colors.grey[300],
            child: Column(
              children: [
                ListTile(title: Text('菜单项 1')),
                ListTile(title: Text('菜单项 2')),
                ListTile(title: Text('菜单项 3')),
              ],
            ),
          ),
          Expanded(
            child: Container(
              color: Colors.white,
              child: Center(
                child: Text('主内容区域'),
              ),
            ),
          ),
        ],
      );
    } else {
      // 窄屏布局
      return Column(
        children: [
          Container(
            height: 100,
            color: Colors.grey[300],
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Text('菜单项 1'),
                Text('菜单项 2'),
                Text('菜单项 3'),
              ],
            ),
          ),
          Expanded(
            child: Container(
              color: Colors.white,
              child: Center(
                child: Text('主内容区域'),
              ),
            ),
          ),
        ],
      );
    }
  },
)
```

## 总结

Flutter 提供了丰富的布局和组件系统，可以满足各种 UI 开发需求。通过组合这些基本组件，可以创建出复杂且美观的用户界面。在实际开发中，应根据需求选择合适的布局和组件，并考虑响应式设计，以适应不同尺寸的设备。
