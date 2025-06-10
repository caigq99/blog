# Flutter UI 基础

## Flutter Widget 概念

Flutter 中的一切都是 Widget。Widget 是 Flutter 应用程序的基本构建块，用于创建用户界面。Widget 描述了其视图在当前配置和状态下应该如何显示。当 Widget 的状态改变时，它会重新构建其描述，框架会将这个描述与之前的描述进行比较，以确定渲染树中需要进行的最小更改。

### Widget 的特点

- **不可变性**：Widget 本身是不可变的，每次状态改变时会创建新的 Widget 实例
- **轻量级**：Widget 本身不是视图，而是视图的描述
- **可组合性**：可以通过组合简单的 Widget 创建复杂的 UI

## 无状态与有状态 Widget

Flutter 中的 Widget 主要分为两类：无状态 Widget (StatelessWidget) 和有状态 Widget (StatefulWidget)。

### StatelessWidget

无状态 Widget 是不可变的，这意味着它们的属性不能改变，所有的值都是最终的。

```dart
class MyStatelessWidget extends StatelessWidget {
  final String text;

  const MyStatelessWidget({Key? key, required this.text}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(text),
    );
  }
}
```

### StatefulWidget

有状态 Widget 可以保持状态，这些状态可能在 Widget 的生命周期内发生变化。StatefulWidget 由两个类组成：一个 StatefulWidget 类和一个 State 类。

```dart
class MyStatefulWidget extends StatefulWidget {
  const MyStatefulWidget({Key? key}) : super(key: key);

  @override
  _MyStatefulWidgetState createState() => _MyStatefulWidgetState();
}

class _MyStatefulWidgetState extends State<MyStatefulWidget> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_counter'),
        ElevatedButton(
          onPressed: _incrementCounter,
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

## Material Design 与 Cupertino 风格

Flutter 提供了两种主要的设计风格：

### Material Design

Material Design 是 Google 的设计语言，Flutter 提供了丰富的 Material Design 组件。

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      appBar: AppBar(
        title: Text('Material App'),
      ),
      body: Center(
        child: Text('Hello World'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: Icon(Icons.add),
      ),
    ),
  ));
}
```

### Cupertino 风格

Cupertino 是 iOS 设计风格的 Flutter 实现。

```dart
import 'package:flutter/cupertino.dart';

void main() {
  runApp(CupertinoApp(
    home: CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Cupertino App'),
      ),
      child: Center(
        child: Text('Hello World'),
      ),
    ),
  ));
}
```

## 主题与样式

Flutter 提供了主题功能，可以统一应用的视觉风格。

### Material 主题

```dart
MaterialApp(
  theme: ThemeData(
    primarySwatch: Colors.blue,
    brightness: Brightness.light,
    textTheme: TextTheme(
      headline1: TextStyle(fontSize: 72.0, fontWeight: FontWeight.bold),
      headline6: TextStyle(fontSize: 36.0, fontStyle: FontStyle.italic),
      bodyText2: TextStyle(fontSize: 14.0, fontFamily: 'Hind'),
    ),
  ),
  // ...
)
```

### Cupertino 主题

```dart
CupertinoApp(
  theme: CupertinoThemeData(
    primaryColor: CupertinoColors.activeBlue,
    brightness: Brightness.light,
    textTheme: CupertinoTextThemeData(
      navTitleTextStyle: TextStyle(
        fontSize: 17.0,
        fontWeight: FontWeight.bold,
      ),
    ),
  ),
  // ...
)
```

## 响应式设计

Flutter 的布局系统天生就是响应式的，可以根据屏幕尺寸和方向自动调整 UI。

```dart
LayoutBuilder(
  builder: (BuildContext context, BoxConstraints constraints) {
    if (constraints.maxWidth > 600) {
      return WideLayout();
    } else {
      return NarrowLayout();
    }
  },
)
```

## 自定义 Widget

创建自定义 Widget 是 Flutter 开发中的常见做法，可以封装特定的 UI 逻辑和外观。

```dart
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        primary: Colors.purple,
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        textStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      onPressed: onPressed,
      child: Text(text),
    );
  }
}
```

## 总结

Flutter UI 开发的核心是 Widget。通过理解无状态和有状态 Widget 的区别，掌握 Material Design 和 Cupertino 风格的组件，以及学会使用主题和自定义 Widget，你可以创建出美观且功能强大的用户界面。
