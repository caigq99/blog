# Flutter 路由与导航

路由和导航是应用程序中不可或缺的部分，它们使用户能够在应用的不同页面之间移动。Flutter 提供了强大的路由系统，支持基本路由、命名路由、路由传参和嵌套导航等功能。本文将详细介绍 Flutter 中的路由与导航机制。

## 基本路由

最简单的导航方式是使用`Navigator`类提供的方法在页面之间进行跳转。`Navigator`采用栈的结构来管理页面，新页面被推入栈顶，返回时从栈顶移除页面。

### 页面跳转（Navigator.push）

使用`Navigator.push`方法导航到新页面：

```dart
// 定义第二个页面
class SecondPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('第二页'),
      ),
      body: Center(
        child: Text('这是第二页'),
      ),
    );
  }
}

// 在第一个页面中导航到第二页
ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => SecondPage()),
    );
  },
  child: Text('跳转到第二页'),
)
```

### 返回上一页（Navigator.pop）

使用`Navigator.pop`方法返回到上一页：

```dart
ElevatedButton(
  onPressed: () {
    Navigator.pop(context);
  },
  child: Text('返回上一页'),
)
```

### 自定义页面过渡动画

Flutter 允许自定义页面之间的过渡动画：

```dart
Navigator.push(
  context,
  PageRouteBuilder(
    pageBuilder: (context, animation, secondaryAnimation) => SecondPage(),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(1.0, 0.0);
      const end = Offset.zero;
      const curve = Curves.easeInOut;

      var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
      var offsetAnimation = animation.drive(tween);

      return SlideTransition(position: offsetAnimation, child: child);
    },
    transitionDuration: Duration(milliseconds: 500),
  ),
);
```

### 替换当前页面（Navigator.pushReplacement）

有时候我们需要替换当前页面，而不是简单地在栈上添加新页面：

```dart
Navigator.pushReplacement(
  context,
  MaterialPageRoute(builder: (context) => NewPage()),
);
```

这在登录流程中特别有用，例如登录成功后，我们不希望用户能够返回到登录页面。

### 清除导航栈并添加新页面（Navigator.pushAndRemoveUntil）

当需要清除导航历史并导航到新页面时，可以使用`pushAndRemoveUntil`：

```dart
Navigator.pushAndRemoveUntil(
  context,
  MaterialPageRoute(builder: (context) => HomePage()),
  (Route<dynamic> route) => false, // 移除所有路由
);
```

第三个参数是一个回调函数，返回`false`表示移除所有路由，也可以设置条件只移除部分路由：

```dart
Navigator.pushAndRemoveUntil(
  context,
  MaterialPageRoute(builder: (context) => HomePage()),
  ModalRoute.withName('/login'), // 保留到登录页面的路由
);
```

## 命名路由

对于较大的应用，使用命名路由可以更好地组织和管理页面导航。命名路由允许我们通过字符串标识符来引用路由，而不是直接使用 Widget 类。

### 定义路由表

在`MaterialApp`或`CupertinoApp`中定义路由表：

```dart
MaterialApp(
  // 初始路由
  initialRoute: '/',

  // 路由表
  routes: {
    '/': (context) => HomePage(),
    '/details': (context) => DetailsPage(),
    '/settings': (context) => SettingsPage(),
    '/profile': (context) => ProfilePage(),
  },
);
```

### 使用命名路由导航

使用`Navigator.pushNamed`方法导航到命名路由：

```dart
ElevatedButton(
  onPressed: () {
    Navigator.pushNamed(context, '/details');
  },
  child: Text('查看详情'),
)
```

同样，也有对应的替换和清除方法：

```dart
// 替换当前页面
Navigator.pushReplacementNamed(context, '/home');

// 清除导航栈并添加新页面
Navigator.pushNamedAndRemoveUntil(
  context,
  '/home',
  (Route<dynamic> route) => false,
);
```

### 处理未知路由

当应用尝试导航到未定义的路由时，可以提供一个`onUnknownRoute`回调来处理：

```dart
MaterialApp(
  // ...
  routes: {
    // ...
  },
  onUnknownRoute: (settings) {
    return MaterialPageRoute(
      builder: (context) => NotFoundPage(),
    );
  },
);
```

### 生成路由（onGenerateRoute）

对于更复杂的路由逻辑，可以使用`onGenerateRoute`回调动态生成路由：

```dart
MaterialApp(
  // ...
  onGenerateRoute: (settings) {
    if (settings.name == '/product') {
      // 提取路由参数
      final args = settings.arguments as Map<String, dynamic>;
      final productId = args['id'];

      return MaterialPageRoute(
        builder: (context) => ProductPage(id: productId),
      );
    }

    // 处理其他路由
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (context) => HomePage());
      case '/settings':
        return MaterialPageRoute(builder: (context) => SettingsPage());
      default:
        return MaterialPageRoute(builder: (context) => NotFoundPage());
    }
  },
);
```

`onGenerateRoute`在以下情况特别有用：

- 需要基于路由名称动态决定显示哪个页面
- 需要解析路由参数
- 需要在导航前进行权限检查
- 需要应用特定的过渡动画

## 路由传参

在页面之间传递数据是常见需求，Flutter 提供了多种方式来实现路由传参。

### 构造函数传参

最直接的方式是通过构造函数传递参数：

```dart
class ProductPage extends StatelessWidget {
  final int id;
  final String name;

  ProductPage({required this.id, required this.name});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: Center(
        child: Text('产品ID: $id'),
      ),
    );
  }
}

// 使用
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => ProductPage(id: 123, name: '智能手表'),
  ),
);
```

### 命名路由传参

使用命名路由时，可以通过`arguments`参数传递数据：

```dart
// 传递参数
Navigator.pushNamed(
  context,
  '/product',
  arguments: {
    'id': 123,
    'name': '智能手表',
  },
);

// 在目标页面接收参数
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // 获取路由参数
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final id = args['id'];
    final name = args['name'];

    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: Center(
        child: Text('产品ID: $id'),
      ),
    );
  }
}
```

### 使用 onGenerateRoute 解析参数

对于更复杂的参数解析，可以在`onGenerateRoute`中处理：

```dart
MaterialApp(
  onGenerateRoute: (settings) {
    // 处理动态路由，例如 /product/123
    var uri = Uri.parse(settings.name!);
    if (uri.pathSegments.length == 2 && uri.pathSegments.first == 'product') {
      var id = int.parse(uri.pathSegments[1]);
      return MaterialPageRoute(
        builder: (context) => ProductPage(id: id),
      );
    }

    // 处理其他路由...
  },
);

// 导航到动态路由
Navigator.pushNamed(context, '/product/123');
```

### 返回数据到上一页

有时需要从目标页面返回数据到源页面，可以使用`Navigator.pop`的第二个参数：

```dart
// 在目标页面返回数据
ElevatedButton(
  onPressed: () {
    Navigator.pop(context, '选择的结果');
  },
  child: Text('确认选择'),
);

// 在源页面接收返回的数据
Future<void> _navigateAndGetResult() async {
  final result = await Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => SelectionPage()),
  );

  // 处理返回的结果
  if (result != null) {
    setState(() {
      _selection = result;
    });
  }
}
```

## 嵌套导航

对于复杂的应用，可能需要在应用的不同部分使用独立的导航栈。Flutter 通过嵌套`Navigator`小部件来支持这一需求。

### 基本嵌套导航

创建嵌套导航器：

```dart
class NestedNavigationExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('主导航')),
      body: Navigator(
        initialRoute: 'nested/home',
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case 'nested/home':
              return MaterialPageRoute(
                builder: (context) => NestedHomePage(),
              );
            case 'nested/details':
              return MaterialPageRoute(
                builder: (context) => NestedDetailsPage(),
              );
            default:
              return MaterialPageRoute(
                builder: (context) => NestedNotFoundPage(),
              );
          }
        },
      ),
    );
  }
}
```

在嵌套导航中，每个`Navigator`维护自己的导航栈，这意味着在嵌套导航中的`pop`操作只会影响当前导航器的栈。

### 使用 NavigatorKey

为了能够从外部访问嵌套导航器，可以使用`GlobalKey<NavigatorState>`：

```dart
final GlobalKey<NavigatorState> _nestedNavigatorKey = GlobalKey<NavigatorState>();

@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(title: Text('主导航')),
    body: Navigator(
      key: _nestedNavigatorKey,
      initialRoute: 'nested/home',
      onGenerateRoute: (settings) {
        // ...
      },
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: () {
        // 使用key访问嵌套导航器
        _nestedNavigatorKey.currentState?.pushNamed('nested/details');
      },
      child: Icon(Icons.navigate_next),
    ),
  );
}
```

### 底部导航栏与嵌套导航

一个常见的用例是在底部导航栏的每个标签页中使用独立的导航栈：

```dart
class BottomNavExample extends StatefulWidget {
  @override
  _BottomNavExampleState createState() => _BottomNavExampleState();
}

class _BottomNavExampleState extends State<BottomNavExample> {
  int _currentIndex = 0;

  // 为每个标签页创建导航器键
  final List<GlobalKey<NavigatorState>> _navigatorKeys = [
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
  ];

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // 处理返回按钮
        final currentNavigatorState = _navigatorKeys[_currentIndex].currentState;
        if (currentNavigatorState?.canPop() ?? false) {
          currentNavigatorState?.pop();
          return false;
        }
        return true;
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: [
            _buildTabNavigator(0, Colors.red),
            _buildTabNavigator(1, Colors.green),
            _buildTabNavigator(2, Colors.blue),
          ],
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: [
            BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
            BottomNavigationBarItem(icon: Icon(Icons.search), label: '搜索'),
            BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
          ],
        ),
      ),
    );
  }

  Widget _buildTabNavigator(int index, Color color) {
    return Navigator(
      key: _navigatorKeys[index],
      initialRoute: '/',
      onGenerateRoute: (settings) {
        if (settings.name == '/') {
          return MaterialPageRoute(
            builder: (context) => TabHomePage(
              color: color,
              title: 'Tab $index',
              onNavigate: () {
                _navigatorKeys[index].currentState?.pushNamed('/details');
              },
            ),
          );
        } else if (settings.name == '/details') {
          return MaterialPageRoute(
            builder: (context) => TabDetailsPage(
              color: color,
              title: 'Tab $index Details',
            ),
          );
        }
        return null;
      },
    );
  }
}

class TabHomePage extends StatelessWidget {
  final Color color;
  final String title;
  final VoidCallback onNavigate;

  TabHomePage({
    required this.color,
    required this.title,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: color.withOpacity(0.3),
      appBar: AppBar(
        title: Text(title),
        backgroundColor: color,
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: onNavigate,
          child: Text('查看详情'),
          style: ElevatedButton.styleFrom(primary: color),
        ),
      ),
    );
  }
}

class TabDetailsPage extends StatelessWidget {
  final Color color;
  final String title;

  TabDetailsPage({
    required this.color,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: color.withOpacity(0.3),
      appBar: AppBar(
        title: Text(title),
        backgroundColor: color,
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: Text('返回'),
          style: ElevatedButton.styleFrom(primary: color),
        ),
      ),
    );
  }
}
```

这个例子使用`IndexedStack`来保持每个标签页的状态，同时使用`WillPopScope`来正确处理返回按钮。

### 使用 Router 和 RouteInformationParser（Flutter 2.0+）

Flutter 2.0 引入了新的导航 API，包括`Router`、`RouteInformationParser`和`RouterDelegate`，这些 API 提供了更强大的路由控制能力，特别适合 Web 应用和深度链接。

```dart
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final AppRouterDelegate _routerDelegate = AppRouterDelegate();
  final AppRouteInformationParser _routeInformationParser = AppRouteInformationParser();

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: '新路由API示例',
      routerDelegate: _routerDelegate,
      routeInformationParser: _routeInformationParser,
    );
  }
}

// 路由配置
class AppRoutePath {
  final String? id;
  final bool isUnknown;

  AppRoutePath.home() : id = null, isUnknown = false;
  AppRoutePath.details(this.id) : isUnknown = false;
  AppRoutePath.unknown() : id = null, isUnknown = true;

  bool get isHomePage => id == null;
  bool get isDetailsPage => id != null;
}

// 路由信息解析器
class AppRouteInformationParser extends RouteInformationParser<AppRoutePath> {
  @override
  Future<AppRoutePath> parseRouteInformation(RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.location!);

    // 处理 '/'
    if (uri.pathSegments.isEmpty) {
      return AppRoutePath.home();
    }

    // 处理 '/details/:id'
    if (uri.pathSegments.length == 2 && uri.pathSegments[0] == 'details') {
      return AppRoutePath.details(uri.pathSegments[1]);
    }

    // 处理未知路由
    return AppRoutePath.unknown();
  }

  @override
  RouteInformation? restoreRouteInformation(AppRoutePath configuration) {
    if (configuration.isUnknown) {
      return RouteInformation(location: '/404');
    }
    if (configuration.isHomePage) {
      return RouteInformation(location: '/');
    }
    if (configuration.isDetailsPage) {
      return RouteInformation(location: '/details/${configuration.id}');
    }
    return null;
  }
}

// 路由委托
class AppRouterDelegate extends RouterDelegate<AppRoutePath>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<AppRoutePath> {
  String? _selectedId;
  bool _show404 = false;

  @override
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  AppRoutePath get currentConfiguration {
    if (_show404) {
      return AppRoutePath.unknown();
    }
    if (_selectedId == null) {
      return AppRoutePath.home();
    }
    return AppRoutePath.details(_selectedId!);
  }

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: [
        // 始终显示主页
        MaterialPage(
          key: ValueKey('HomePage'),
          child: HomePage(
            onItemTapped: (id) {
              _selectedId = id;
              notifyListeners();
            },
          ),
        ),
        // 有选中项时显示详情页
        if (_selectedId != null)
          MaterialPage(
            key: ValueKey('DetailsPage-$_selectedId'),
            child: DetailsPage(
              id: _selectedId!,
            ),
          ),
        // 显示404页面
        if (_show404)
          MaterialPage(
            key: ValueKey('UnknownPage'),
            child: UnknownPage(),
          ),
      ],
      onPopPage: (route, result) {
        if (!route.didPop(result)) {
          return false;
        }

        // 返回时清除选中状态
        _selectedId = null;
        _show404 = false;
        notifyListeners();
        return true;
      },
    );
  }

  @override
  Future<void> setNewRoutePath(AppRoutePath configuration) async {
    if (configuration.isUnknown) {
      _show404 = true;
      _selectedId = null;
      return;
    }

    if (configuration.isDetailsPage) {
      _selectedId = configuration.id;
    } else {
      _selectedId = null;
    }

    _show404 = false;
  }
}
```

这个例子展示了如何使用新的导航 API 来处理路由。`RouteInformationParser`负责解析 URL，`RouterDelegate`负责构建导航器和页面栈。

## 路由最佳实践

### 1. 使用常量定义路由名称

为避免拼写错误，应该使用常量定义路由名称：

```dart
class Routes {
  static const String home = '/';
  static const String details = '/details';
  static const String settings = '/settings';
  static const String profile = '/profile';
}

// 使用
Navigator.pushNamed(context, Routes.details);
```

### 2. 创建路由生成工厂

对于大型应用，可以创建一个集中管理路由的工厂类：

```dart
class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case Routes.home:
        return MaterialPageRoute(builder: (_) => HomePage());
      case Routes.details:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => DetailsPage(id: args['id']),
        );
      case Routes.settings:
        return MaterialPageRoute(builder: (_) => SettingsPage());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('找不到路由: ${settings.name}'),
            ),
          ),
        );
    }
  }
}

// 在应用中使用
MaterialApp(
  onGenerateRoute: AppRouter.generateRoute,
  initialRoute: Routes.home,
);
```

### 3. 使用页面转场动画

为不同类型的页面定义不同的转场动画可以提升用户体验：

```dart
class SlideRightRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  SlideRightRoute({required this.page})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(1.0, 0.0);
            const end = Offset.zero;
            const curve = Curves.easeInOut;

            var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
            var offsetAnimation = animation.drive(tween);

            return SlideTransition(position: offsetAnimation, child: child);
          },
        );
}

// 使用自定义路由
Navigator.push(
  context,
  SlideRightRoute(page: DetailsPage()),
);
```

### 4. 处理深层导航返回

在嵌套导航中，正确处理返回按钮是很重要的：

```dart
WillPopScope(
  onWillPop: () async {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return false;
    }
    return true;
  },
  child: Scaffold(
    // ...
  ),
)
```

### 5. 使用 Hero 动画实现共享元素转场

Hero 动画可以在页面转场时创建共享元素效果：

```dart
// 在列表页面
Hero(
  tag: 'product-$id',
  child: Image.network(imageUrl),
)

// 在详情页面
Hero(
  tag: 'product-$id',
  child: Image.network(imageUrl),
)
```

## 小结

Flutter 提供了丰富的路由和导航功能，从简单的页面跳转到复杂的嵌套导航，都有相应的解决方案。本文介绍了：

1. **基本路由**：使用`Navigator.push`和`Navigator.pop`进行页面跳转和返回
2. **命名路由**：通过字符串标识符引用路由，使代码更清晰
3. **路由传参**：在页面之间传递数据的多种方式
4. **嵌套导航**：在应用的不同部分使用独立的导航栈
5. **新路由 API**：Flutter 2.0 引入的更强大的路由控制功能

选择合适的导航方式取决于应用的复杂度和需求。对于简单应用，基本路由可能已经足够；而对于大型应用，命名路由和嵌套导航可能更为适合。无论选择哪种方式，良好的路由架构都能提升应用的可维护性和用户体验。
