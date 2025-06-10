# Flutter 插件和平台集成

在Flutter开发中，有时我们需要访问平台特定的功能，如相机、传感器、蓝牙等。Flutter通过插件系统提供了一种机制，使开发者能够编写原生代码并将其与Flutter应用集成。本文将介绍如何使用现有插件以及如何创建自定义插件来扩展Flutter应用的功能。

## 使用现有插件

Flutter拥有丰富的插件生态系统，可以在[pub.dev](https://pub.dev)上找到各种各样的插件。

### 添加插件依赖

要使用插件，首先需要在`pubspec.yaml`文件中添加依赖：

```yaml
dependencies:
  flutter:
    sdk: flutter
  # 添加插件依赖
  camera: ^0.10.5+5
  url_launcher: ^6.1.14
  shared_preferences: ^2.2.1
```

然后运行以下命令安装依赖：

```bash
flutter pub get
```

### 使用插件API

安装插件后，就可以在代码中导入并使用插件提供的API：

```dart
import 'package:camera/camera.dart';
import 'package:url_launcher/url_launcher.dart';

// 使用相机插件
Future<void> initializeCamera() async {
  // 获取可用的相机列表
  final cameras = await availableCameras();
  final firstCamera = cameras.first;
  
  // 创建相机控制器
  final controller = CameraController(
    firstCamera,
    ResolutionPreset.medium,
  );
  
  // 初始化控制器
  await controller.initialize();
  
  // 使用控制器...
}

// 使用URL启动器插件
Future<void> launchURL() async {
  const url = 'https://flutter.dev';
  final Uri _url = Uri.parse(url);
  if (await canLaunchUrl(_url)) {
    await launchUrl(_url);
  } else {
    throw '无法启动 $url';
  }
}
```

### 处理平台权限

许多插件需要特定的平台权限才能工作。这些权限需要在平台特定的配置文件中声明：

#### Android权限

在`android/app/src/main/AndroidManifest.xml`文件中添加所需权限：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 相机权限 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <!-- 互联网权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <!-- 位置权限 -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <application
        android:label="my_app"
        android:icon="@mipmap/ic_launcher">
        <!-- ... -->
    </application>
</manifest>
```

#### iOS权限

在`ios/Runner/Info.plist`文件中添加所需权限描述：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- ... 其他配置 ... -->
    
    <!-- 相机权限 -->
    <key>NSCameraUsageDescription</key>
    <string>此应用需要访问相机以拍摄照片</string>
    
    <!-- 位置权限 -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>此应用需要访问您的位置以提供基于位置的服务</string>
    
    <!-- 照片库权限 -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>此应用需要访问照片库以选择图片</string>
</dict>
</plist>
```

### 运行时请求权限

除了在配置文件中声明权限外，还需要在运行时请求用户授予权限：

```dart
import 'package:permission_handler/permission_handler.dart';

Future<void> requestCameraPermission() async {
  // 请求相机权限
  var status = await Permission.camera.status;
  if (!status.isGranted) {
    status = await Permission.camera.request();
    if (!status.isGranted) {
      // 用户拒绝了权限请求
      return;
    }
  }
  
  // 权限已授予，可以使用相机
  // ...
}
```

## 创建自定义插件

当现有插件无法满足需求时，可以创建自定义插件。Flutter插件包含Dart代码和平台特定代码（Android/iOS/Web等）。

### 创建插件项目

使用Flutter CLI创建一个新的插件项目：

```bash
flutter create --template=plugin my_plugin
```

这将创建一个包含以下目录结构的插件项目：

```
my_plugin/
  ├── android/          # Android平台代码
  ├── ios/              # iOS平台代码
  ├── lib/              # Dart代码
  ├── example/          # 示例应用
  ├── test/             # 测试代码
  └── pubspec.yaml      # 项目配置
```

### 定义插件API

在`lib/my_plugin.dart`文件中定义插件的Dart API：

```dart
import 'dart:async';
import 'package:flutter/services.dart';

class MyPlugin {
  // 定义方法通道
  static const MethodChannel _channel = MethodChannel('my_plugin');

  // 插件API方法
  static Future<String?> getPlatformVersion() async {
    final String? version = await _channel.invokeMethod('getPlatformVersion');
    return version;
  }
  
  // 自定义方法
  static Future<int> getBatteryLevel() async {
    final int batteryLevel = await _channel.invokeMethod('getBatteryLevel');
    return batteryLevel;
  }
}
```

### 实现Android平台代码

在`android/src/main/kotlin/.../MyPlugin.kt`文件中实现Android平台代码：

```kotlin
package com.example.my_plugin

import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import androidx.annotation.NonNull
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result

class MyPlugin: FlutterPlugin, MethodCallHandler {
  private lateinit var channel : MethodChannel
  private lateinit var context: Context

  override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
    channel = MethodChannel(flutterPluginBinding.binaryMessenger, "my_plugin")
    context = flutterPluginBinding.applicationContext
    channel.setMethodCallHandler(this)
  }

  override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
    when (call.method) {
      "getPlatformVersion" -> {
        result.success("Android ${Build.VERSION.RELEASE}")
      }
      "getBatteryLevel" -> {
        val batteryLevel = getBatteryLevel()
        if (batteryLevel != -1) {
          result.success(batteryLevel)
        } else {
          result.error("UNAVAILABLE", "无法获取电池电量", null)
        }
      }
      else -> {
        result.notImplemented()
      }
    }
  }

  private fun getBatteryLevel(): Int {
    val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
  }

  override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
    channel.setMethodCallHandler(null)
  }
}
```

### 实现iOS平台代码

在`ios/Classes/SwiftMyPlugin.swift`文件中实现iOS平台代码：

```swift
import Flutter
import UIKit

public class SwiftMyPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "my_plugin", binaryMessenger: registrar.messenger())
    let instance = SwiftMyPlugin()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    switch call.method {
    case "getPlatformVersion":
      result("iOS " + UIDevice.current.systemVersion)
    case "getBatteryLevel":
      let device = UIDevice.current
      device.isBatteryMonitoringEnabled = true
      
      if device.batteryState == UIDevice.BatteryState.unknown {
        result(FlutterError(code: "UNAVAILABLE", 
                           message: "无法获取电池信息", 
                           details: nil))
      } else {
        result(Int(device.batteryLevel * 100))
      }
    default:
      result(FlutterMethodNotImplemented)
    }
  }
}
```

### 测试插件

在`example`目录中有一个示例应用，可以用来测试插件功能：

```dart
import 'package:flutter/material.dart';
import 'package:my_plugin/my_plugin.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String _platformVersion = 'Unknown';
  int _batteryLevel = -1;

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  Future<void> initPlatformState() async {
    String platformVersion;
    int batteryLevel;
    
    try {
      platformVersion = await MyPlugin.getPlatformVersion() ?? 'Unknown platform version';
      batteryLevel = await MyPlugin.getBatteryLevel();
    } catch (e) {
      platformVersion = 'Failed to get platform version.';
      batteryLevel = -1;
    }

    if (!mounted) return;

    setState(() {
      _platformVersion = platformVersion;
      _batteryLevel = batteryLevel;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Plugin example app'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Running on: $_platformVersion\n'),
              Text('Battery level: $_batteryLevel%'),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 发布插件

完成插件开发后，可以将其发布到[pub.dev](https://pub.dev)，让其他开发者使用：

1. 确保`pubspec.yaml`文件包含正确的元数据
2. 运行`flutter pub publish --dry-run`检查是否有问题
3. 运行`flutter pub publish`发布插件

## 平台通道

Flutter使用平台通道（Platform Channels）与原生平台代码通信。有三种类型的平台通道：

### MethodChannel

用于调用平台特定的方法，如上面的示例所示。

### EventChannel

用于接收来自平台的事件流，如传感器数据、位置更新等。

```dart
// Dart代码
import 'dart:async';
import 'package:flutter/services.dart';

class AccelerometerPlugin {
  static const EventChannel _accelerometerChannel = 
      EventChannel('com.example/accelerometer');
      
  static Stream<AccelerometerEvent> get accelerometerEvents {
    return _accelerometerChannel
        .receiveBroadcastStream()
        .map((dynamic event) => AccelerometerEvent.fromList(event.cast<double>()));
  }
}

class AccelerometerEvent {
  final double x;
  final double y;
  final double z;
  
  AccelerometerEvent(this.x, this.y, this.z);
  
  factory AccelerometerEvent.fromList(List<double> list) {
    return AccelerometerEvent(list[0], list[1], list[2]);
  }
}
```

```kotlin
// Android代码
class AccelerometerStreamHandler : EventChannel.StreamHandler {
  private var sensorManager: SensorManager? = null
  private var accelerometerListener: SensorEventListener? = null
  private var eventSink: EventChannel.EventSink? = null

  override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
    sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    val accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    
    eventSink = events
    accelerometerListener = createSensorEventListener()
    
    sensorManager?.registerListener(
      accelerometerListener,
      accelerometer,
      SensorManager.SENSOR_DELAY_NORMAL
    )
  }

  override fun onCancel(arguments: Any?) {
    sensorManager?.unregisterListener(accelerometerListener)
    accelerometerListener = null
    eventSink = null
  }

  private fun createSensorEventListener(): SensorEventListener {
    return object : SensorEventListener {
      override fun onSensorChanged(event: SensorEvent) {
        val values = listOf(event.values[0], event.values[1], event.values[2])
        eventSink?.success(values)
      }

      override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
    }
  }
}
```
