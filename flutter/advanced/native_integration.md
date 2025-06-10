# Flutter 原生集成

Flutter 作为一个跨平台框架，有时需要与原生平台（Android/iOS）进行交互，以使用平台特定的功能或集成第三方 SDK。本教程将介绍 Flutter 与原生平台的集成方法。

## 目录

- [平台通道](#平台通道)
- [原生插件开发](#原生插件开发)
- [集成第三方 SDK](#集成第三方-sdk)
- [Firebase 服务集成](#firebase-服务集成)

## 平台通道

平台通道是 Flutter 与原生代码通信的桥梁，允许 Flutter 调用原生功能，反之亦然。

### 平台通道类型

Flutter 提供了三种类型的平台通道：

1. **MethodChannel**：用于方法调用，最常用的通道类型
2. **EventChannel**：用于事件流，如传感器数据、网络状态变化等
3. **BasicMessageChannel**：用于传递基本数据类型和二进制数据

### MethodChannel 示例

#### Dart 端代码

```dart
// 创建方法通道
const platform = MethodChannel('com.example.app/battery');

// 调用原生方法
Future<void> getBatteryLevel() async {
  try {
    final int batteryLevel = await platform.invokeMethod('getBatteryLevel');
    setState(() {
      _batteryLevel = batteryLevel;
    });
  } on PlatformException catch (e) {
    setState(() {
      _batteryLevel = -1;
    });
  }
}
```

#### Android 端代码 (Kotlin)

```kotlin
class MainActivity: FlutterActivity() {
  private val CHANNEL = "com.example.app/battery"

  override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
    super.configureFlutterEngine(flutterEngine)
    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
      call, result ->
      if (call.method == "getBatteryLevel") {
        val batteryLevel = getBatteryLevel()
        if (batteryLevel != -1) {
          result.success(batteryLevel)
        } else {
          result.error("UNAVAILABLE", "Battery level not available.", null)
        }
      } else {
        result.notImplemented()
      }
    }
  }

  private fun getBatteryLevel(): Int {
    val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
  }
}
```

#### iOS 端代码 (Swift)

```swift
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)

    let controller : FlutterViewController = window?.rootViewController as! FlutterViewController
    let batteryChannel = FlutterMethodChannel(name: "com.example.app/battery",
                                              binaryMessenger: controller.binaryMessenger)
    batteryChannel.setMethodCallHandler({
      (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
      guard call.method == "getBatteryLevel" else {
        result(FlutterMethodNotImplemented)
        return
      }
      self.receiveBatteryLevel(result: result)
    })

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  private func receiveBatteryLevel(result: FlutterResult) {
    let device = UIDevice.current
    device.isBatteryMonitoringEnabled = true

    if device.batteryState == UIDevice.BatteryState.unknown {
      result(FlutterError(code: "UNAVAILABLE",
                          message: "Battery level not available.",
                          details: nil))
    } else {
      result(Int(device.batteryLevel * 100))
    }
  }
}
```

### EventChannel 示例

EventChannel 用于从原生端向 Flutter 传递事件流，如传感器数据、位置更新等。

#### Dart 端代码

```dart
// 创建事件通道
const EventChannel accelerometerChannel =
    EventChannel('com.example.app/accelerometer');

// 监听事件流
StreamSubscription<dynamic>? _streamSubscription;

void _startListening() {
  _streamSubscription = accelerometerChannel
      .receiveBroadcastStream()
      .listen(_onAccelerometerEvent, onError: _onAccelerometerError);
}

void _onAccelerometerEvent(dynamic event) {
  setState(() {
    _accelerometerValues = event.cast<double>();
  });
}

void _onAccelerometerError(Object error) {
  print('Accelerometer error: $error');
}

void _stopListening() {
  _streamSubscription?.cancel();
  _streamSubscription = null;
}
```

## 原生插件开发

当需要在多个 Flutter 项目中重用原生功能时，可以创建 Flutter 插件。

### 创建插件

使用 Flutter CLI 创建插件项目：

```bash
flutter create --template=plugin my_plugin
```

这将创建一个包含 Android 和 iOS 实现的插件项目。

### 插件结构

一个典型的 Flutter 插件项目结构如下：

```
my_plugin/
├── android/                  # Android 平台实现
├── ios/                      # iOS 平台实现
├── lib/                      # Dart API
├── example/                  # 示例应用
├── pubspec.yaml              # 插件配置
└── README.md                 # 文档
```

### 实现插件

1. 在 `lib/my_plugin.dart` 中定义 Dart API
2. 在 `android/src/.../MyPlugin.kt` 中实现 Android 功能
3. 在 `ios/Classes/MyPlugin.swift` 中实现 iOS 功能

### 发布插件

完成插件开发后，可以将其发布到 [pub.dev](https://pub.dev)：

```bash
flutter pub publish
```

## 集成第三方 SDK

有时需要在 Flutter 应用中集成第三方 SDK，如地图、支付、分析等。

### 方法一：使用现有 Flutter 插件

许多常用的第三方 SDK 已经有对应的 Flutter 插件，可以直接使用：

```yaml
# pubspec.yaml
dependencies:
  google_maps_flutter: ^2.0.0
  firebase_analytics: ^9.0.0
```

### 方法二：创建包装插件

如果没有现成的 Flutter 插件，可以创建一个包装原生 SDK 的插件：

1. 创建 Flutter 插件项目
2. 在 Android 和 iOS 项目中添加第三方 SDK 依赖
3. 使用平台通道暴露 SDK 功能

### 示例：集成支付宝 SDK

#### Android 集成

在 `android/build.gradle` 中添加依赖：

```gradle
dependencies {
    implementation 'com.alipay.sdk:alipay-android-sdk:15.8.03'
}
```

#### iOS 集成

在 `ios/my_plugin.podspec` 中添加依赖：

```ruby
s.dependency 'AlipaySDK-iOS'
```

## Firebase 服务集成

Firebase 是 Google 提供的一套移动应用开发平台，提供了分析、数据库、消息推送等服务。Flutter 官方提供了 Firebase 插件集合。

### 设置 Firebase

1. 在 [Firebase 控制台](https://console.firebase.google.com/) 创建项目
2. 添加 Android 和 iOS 应用
3. 下载配置文件：
   - Android: `google-services.json` 放入 `android/app/`
   - iOS: `GoogleService-Info.plist` 放入 `ios/Runner/`

### 添加 Firebase 依赖

```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^2.4.0
  firebase_analytics: ^10.0.0
  firebase_auth: ^4.2.0
  cloud_firestore: ^4.2.0
  firebase_storage: ^11.0.0
  firebase_messaging: ^14.2.0
```

### 初始化 Firebase

```dart
import 'package:firebase_core/firebase_core.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MyApp());
}
```

### 使用 Firebase 服务

#### Firebase Authentication

```dart
import 'package:firebase_auth/firebase_auth.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;

Future<UserCredential> signInWithEmailAndPassword(String email, String password) async {
  return await _auth.signInWithEmailAndPassword(
    email: email,
    password: password,
  );
}
```

#### Cloud Firestore

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

final FirebaseFirestore _firestore = FirebaseFirestore.instance;

Future<void> addUser(String userId, String name, int age) async {
  await _firestore.collection('users').doc(userId).set({
    'name': name,
    'age': age,
    'createdAt': FieldValue.serverTimestamp(),
  });
}
```

#### Firebase Cloud Messaging

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

final FirebaseMessaging _messaging = FirebaseMessaging.instance;

Future<void> setupPushNotifications() async {
  // 请求权限
  NotificationSettings settings = await _messaging.requestPermission();

  // 获取 FCM 令牌
  String? token = await _messaging.getToken();
  print('FCM Token: $token');

  // 处理前台消息
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Got a message whilst in the foreground!');
    print('Message data: ${message.data}');

    if (message.notification != null) {
      print('Message also contained a notification: ${message.notification}');
    }
  });
}
```

## 最佳实践

1. **平台检查**：在调用平台特定功能前检查当前平台

   ```dart
   if (Platform.isAndroid) {
     // Android 特定代码
   } else if (Platform.isIOS) {
     // iOS 特定代码
   }
   ```

2. **错误处理**：始终处理平台通道调用可能出现的错误

3. **异步处理**：平台通道调用是异步的，使用 `async/await` 处理

4. **代码组织**：将平台特定代码分离到单独的文件中

5. **测试**：为原生集成代码编写测试，确保跨平台兼容性

## 练习

1. 创建一个使用 MethodChannel 获取设备信息的 Flutter 应用
2. 开发一个简单的 Flutter 插件，提供一个原生功能
3. 集成 Firebase Analytics 和 Crashlytics 到 Flutter 应用
4. 使用 EventChannel 监听设备传感器数据

## 参考资源

- [Flutter 官方文档 - 平台集成](https://flutter.dev/docs/development/platform-integration)
- [Flutter 插件开发指南](https://flutter.dev/docs/development/packages-and-plugins/developing-packages)
- [Firebase Flutter 文档](https://firebase.flutter.dev/docs/overview/)
- [Flutter 社区插件](https://pub.dev/flutter/packages)
