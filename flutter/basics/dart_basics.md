# Dart 语言基础

Dart 是 Flutter 应用开发的官方编程语言，由 Google 开发。它是一种面向对象的、类定义的、垃圾回收式语言，具有 C 风格语法。Dart 可以编译成原生代码或 JavaScript，支持接口、混入、抽象类、具体化泛型和类型推断。

## Dart 语法入门

### 基本语法结构

Dart 程序的基本结构如下：

```dart
// 导入库
import 'dart:math';

// 主函数，程序入口
void main() {
  // 打印输出
  print('Hello, Dart!');

  // 调用函数
  var result = calculateSum(5, 3);
  print('Sum: $result');
}

// 函数定义
int calculateSum(int a, int b) {
  return a + b;
}
```

### 注释

Dart 支持三种类型的注释：

```dart
// 单行注释

/*
  多行注释
  可以跨越多行
*/

/// 文档注释，用于生成API文档
/// 支持Markdown语法
```

## 变量与数据类型

### 变量声明

Dart 变量声明有多种方式：

```dart
// 使用var关键字，类型由编译器推断
var name = 'Bob';

// 明确指定类型
String name = 'Bob';

// 使用final声明一个只能赋值一次的变量
final String name = 'Bob';

// 使用const声明编译时常量
const double pi = 3.14159;

// 使用dynamic声明动态类型变量
dynamic value = 'A string';
value = 100; // 可以改变类型
```

### 内置数据类型

Dart 支持以下内置数据类型：

1. **数字类型**：

   ```dart
   // 整数
   int x = 1;

   // 浮点数
   double y = 1.1;

   // num可以是int或double
   num z = 1;
   z = 1.1;
   ```

2. **字符串**：

   ```dart
   // 单引号或双引号都可以
   String s1 = 'Single quotes';
   String s2 = "Double quotes";

   // 三引号支持多行字符串
   String multiLine = '''
   This is a
   multi-line string.
   ''';

   // 字符串插值
   String name = 'Bob';
   print('Hello, $name!'); // 使用变量
   print('1 + 1 = ${1 + 1}'); // 使用表达式
   ```

3. **布尔类型**：

   ```dart
   bool isTrue = true;
   bool isFalse = false;
   ```

4. **列表（List）**：

   ```dart
   // 创建列表
   List<int> numbers = [1, 2, 3];

   // 使用var
   var fruits = ['apple', 'banana', 'orange'];

   // 添加元素
   fruits.add('mango');

   // 访问元素
   print(fruits[0]); // apple

   // 列表长度
   print(fruits.length); // 4
   ```

5. **集合（Set）**：

   ```dart
   // 创建集合
   Set<String> uniqueNames = {'Alice', 'Bob', 'Charlie'};

   // 添加元素
   uniqueNames.add('David');

   // 检查元素是否存在
   print(uniqueNames.contains('Alice')); // true
   ```

6. **映射（Map）**：

   ```dart
   // 创建映射
   Map<String, int> ages = {
     'Alice': 25,
     'Bob': 30,
     'Charlie': 35
   };

   // 访问元素
   print(ages['Alice']); // 25

   // 添加或更新元素
   ages['David'] = 40;
   ```

7. **Runes**：表示字符串中的 Unicode 字符

   ```dart
   var heart = '\u2665';
   print(heart); // ♥
   ```

8. **Symbol**：表示 Dart 程序中声明的运算符或标识符
   ```dart
   #radix
   #bar
   ```

## 函数与面向对象编程

### 函数定义与调用

```dart
// 基本函数定义
int add(int a, int b) {
  return a + b;
}

// 可选位置参数
String sayHello(String name, [String greeting = 'Hello']) {
  return '$greeting, $name!';
}

// 命名参数
void printPerson({required String name, int age = 0}) {
  print('Name: $name, Age: $age');
}

// 箭头函数（单行函数的简写）
int multiply(int a, int b) => a * b;

// 函数作为参数
void doSomething(int Function(int, int) operation) {
  print(operation(3, 4));
}

// 匿名函数
var sum = (int a, int b) {
  return a + b;
};
```

### 类与对象

```dart
// 类定义
class Person {
  // 实例变量
  String name;
  int age;

  // 构造函数
  Person(this.name, this.age);

  // 命名构造函数
  Person.guest() {
    name = 'Guest';
    age = 0;
  }

  // 方法
  void introduce() {
    print('My name is $name and I am $age years old.');
  }
}

// 使用类
void main() {
  var person = Person('Alice', 25);
  person.introduce();

  var guest = Person.guest();
  guest.introduce();
}
```

### 继承

```dart
// 父类
class Animal {
  String name;

  Animal(this.name);

  void makeSound() {
    print('Some generic sound');
  }
}

// 子类
class Dog extends Animal {
  Dog(String name) : super(name);

  // 重写方法
  @override
  void makeSound() {
    print('Woof!');
  }
}
```

### 接口与抽象类

Dart 中没有 interface 关键字，任何类都可以作为接口被实现：

```dart
// 抽象类
abstract class Shape {
  // 抽象方法，没有实现
  double calculateArea();

  // 普通方法，有默认实现
  void printInfo() {
    print('This is a shape with area: ${calculateArea()}');
  }
}

// 实现抽象类
class Circle extends Shape {
  double radius;

  Circle(this.radius);

  @override
  double calculateArea() {
    return 3.14 * radius * radius;
  }
}

// 实现多个接口
class Television implements Remote, ElectronicDevice {
  // 必须实现Remote和ElectronicDevice中的所有方法
}
```

### Mixin

Mixin 是一种在多个类层次结构中重用代码的方式：

```dart
mixin Musical {
  bool canPlayPiano = false;
  bool canCompose = false;

  void playInstrument() {
    print('Playing piano...');
  }
}

mixin Aggressive {
  void attack() {
    print('Attacking...');
  }
}

// 使用mixin
class Musician extends Person with Musical {
  Musician(String name, int age) : super(name, age);
}

class Warrior extends Person with Aggressive {
  Warrior(String name, int age) : super(name, age);
}

// 多个mixin
class BattleBard extends Person with Musical, Aggressive {
  BattleBard(String name, int age) : super(name, age);
}
```

## 异步编程

### Future

Future 表示一个异步操作的结果：

```dart
// 创建Future
Future<String> fetchUserData() {
  return Future.delayed(Duration(seconds: 2), () {
    return '{"name": "John", "age": 30}';
  });
}

// 使用Future
void main() {
  print('Fetching user data...');

  fetchUserData().then((data) {
    print('User data: $data');
  }).catchError((error) {
    print('Error: $error');
  }).whenComplete(() {
    print('Fetch completed');
  });

  print('This runs before fetchUserData completes');
}
```

### async/await

async 和 await 关键字提供了更简洁的异步代码编写方式：

```dart
// 使用async/await
Future<void> main() async {
  print('Fetching user data...');

  try {
    String data = await fetchUserData();
    print('User data: $data');
  } catch (error) {
    print('Error: $error');
  } finally {
    print('Fetch completed');
  }

  print('This runs after fetchUserData completes');
}
```

### Stream

Stream 表示一系列异步事件：

```dart
// 创建Stream
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// 使用Stream
void main() async {
  // 监听Stream
  Stream<int> stream = countStream(5);

  // 方法1：await for
  await for (int value in stream) {
    print(value);
  }

  // 方法2：listen
  stream.listen(
    (value) => print(value),
    onError: (error) => print('Error: $error'),
    onDone: () => print('Stream completed'),
  );
}
```

## Dart 语言的高级特性

### 空安全

Dart 2.12 引入了健全的空安全，使开发者能够避免空引用异常：

```dart
// 可空类型
String? nullableName;

// 非空类型
String nonNullableName = 'John';

// 空检查
void printName(String? name) {
  // 使用?. 运算符安全访问
  print(name?.toUpperCase());

  // 使用! 运算符断言非空
  print(name!.toUpperCase()); // 如果name为null，会抛出异常

  // 使用??运算符提供默认值
  print((name ?? 'Unknown').toUpperCase());

  // 使用条件判断
  if (name != null) {
    print(name.toUpperCase());
  }
}
```

### 泛型

泛型允许类型安全的代码重用：

```dart
// 泛型类
class Box<T> {
  T value;

  Box(this.value);

  T getValue() {
    return value;
  }
}

// 泛型函数
T first<T>(List<T> list) {
  return list.first;
}

// 使用泛型
void main() {
  var intBox = Box<int>(42);
  var stringBox = Box<String>('Hello');

  print(intBox.getValue()); // 42
  print(stringBox.getValue()); // Hello

  var numbers = [1, 2, 3];
  print(first<int>(numbers)); // 1
}
```

### 扩展方法

扩展方法允许向现有类添加功能，而无需修改原始类：

```dart
// 为String类添加扩展方法
extension StringExtension on String {
  bool isValidEmail() {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
  }

  String capitalize() {
    if (this.isEmpty) return this;
    return '${this[0].toUpperCase()}${this.substring(1)}';
  }
}

// 使用扩展方法
void main() {
  print('test@example.com'.isValidEmail()); // true
  print('invalid'.isValidEmail()); // false
  print('hello'.capitalize()); // Hello
}
```

## 学习资源

1. [Dart 官方文档](https://dart.dev/guides)
2. [DartPad 在线编辑器](https://dartpad.dev/)
3. [Dart 语言之旅](https://dart.dev/guides/language/language-tour)
4. [Dart API 参考](https://api.dart.dev/)
5. [Dart SDK GitHub 仓库](https://github.com/dart-lang/sdk)

## 下一步学习

掌握 Dart 语言基础后，下一步是学习 Flutter UI 基础，了解如何使用 Flutter 框架构建用户界面。
