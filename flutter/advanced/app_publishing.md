# Flutter 发布应用

将 Flutter 应用发布到应用商店是开发流程的最后一步。本教程将介绍 Flutter 应用的签名、打包和发布流程，以及自动化部署策略。

## 目录

- [应用签名与打包](#应用签名与打包)
- [App Store 发布流程](#app-store-发布流程)
- [Google Play 发布流程](#google-play-发布流程)
- [CI/CD 自动化部署](#cicd-自动化部署)

## 应用签名与打包

在发布应用前，需要对应用进行签名和打包，以确保应用的安全性和完整性。

### Android 应用签名

Android 应用需要使用密钥库 (Keystore) 进行签名。

#### 创建密钥库

```bash
keytool -genkey -v -keystore ~/key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
```

执行此命令后，会提示输入密码和其他信息，生成密钥库文件。

#### 配置签名信息

在项目的 `android/app/build.gradle` 文件中配置签名信息：

```gradle
android {
    ...

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

为了安全起见，不要将密钥信息直接写入代码。创建 `android/key.properties` 文件：

```properties
storePassword=<密码>
keyPassword=<密码>
keyAlias=key
storeFile=<密钥库路径>
```

然后在 `android/app/build.gradle` 文件顶部加载这些属性：

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

**注意**：不要将 `key.properties` 文件提交到版本控制系统。

### iOS 应用签名

iOS 应用需要通过 Apple 开发者账号进行签名。

#### 配置签名证书

1. 在 Xcode 中打开 Flutter 项目的 iOS 部分：

```bash
open ios/Runner.xcworkspace
```

2. 在 Xcode 中，选择 `Runner` 项目 → `Signing & Capabilities` 选项卡
3. 选择您的开发团队
4. 设置正确的 Bundle Identifier

### 打包应用

#### 构建 Android 应用

```bash
# 构建 APK
flutter build apk --release

# 构建 App Bundle (推荐)
flutter build appbundle --release
```

构建完成后，可以在以下位置找到生成的文件：

- APK: `build/app/outputs/flutter-apk/app-release.apk`
- AAB: `build/app/outputs/bundle/release/app-release.aab`

#### 构建 iOS 应用

```bash
flutter build ios --release
```

然后在 Xcode 中构建和归档应用：

1. 打开 Xcode 项目
2. 选择 `Product` → `Archive`
3. 在归档窗口中选择 `Distribute App`

## App Store 发布流程

将 Flutter 应用发布到 Apple App Store 需要完成以下步骤：

### 准备工作

1. 注册 [Apple Developer Program](https://developer.apple.com/programs/)（年费 $99）
2. 创建应用图标和启动屏幕
3. 准备应用截图和宣传材料
4. 确保应用符合 [App Store 审核指南](https://developer.apple.com/app-store/review/guidelines/)

### 应用配置

1. 在 `ios/Runner/Info.plist` 文件中设置必要的权限和描述：

```xml
<key>NSCameraUsageDescription</key>
<string>此应用需要访问相机以拍摄照片</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>此应用需要访问照片库以选择图片</string>
```

2. 配置应用版本：

在 `pubspec.yaml` 文件中设置版本号：

```yaml
version: 1.0.0+1 # 格式为 version_name+version_code
```

### 创建 App Store Connect 条目

1. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
2. 点击 `我的应用` → `+` → `新建应用`
3. 填写应用信息，包括名称、平台、Bundle ID 等
4. 完成应用元数据设置，包括描述、关键词、截图等

### 上传应用

有两种方法上传应用：

#### 方法一：通过 Xcode

1. 在 Xcode 中归档应用
2. 选择 `Distribute App` → `App Store Connect` → `Upload`
3. 按照向导完成上传

#### 方法二：通过 Transporter

1. 在 Xcode 中导出 IPA 文件
2. 使用 Apple 的 Transporter 工具上传 IPA

### 提交审核

1. 在 App Store Connect 中完成所有必要信息
2. 点击 `提交以供审核`
3. 等待 Apple 审核（通常需要 1-3 天）
4. 审核通过后，设置发布日期

## Google Play 发布流程

将 Flutter 应用发布到 Google Play 商店需要完成以下步骤：

### 准备工作

1. 注册 [Google Play 开发者账号](https://play.google.com/console/signup)（一次性费用 $25）
2. 创建应用图标和宣传图片
3. 准备应用截图和宣传材料
4. 确保应用符合 [Google Play 政策](https://play.google.com/about/developer-content-policy/)

### 应用配置

1. 在 `android/app/src/main/AndroidManifest.xml` 文件中设置必要的权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<!-- 其他需要的权限 -->
```

2. 配置应用版本：

在 `pubspec.yaml` 文件中设置版本号：

```yaml
version: 1.0.0+1 # 格式为 version_name+version_code
```

### 创建 Google Play 条目

1. 登录 [Google Play Console](https://play.google.com/console)
2. 点击 `创建应用`
3. 填写应用信息，包括名称、默认语言等
4. 完成应用元数据设置，包括描述、图片等

### 上传应用

1. 在 Google Play Console 中，导航到 `应用版本` → `生产版本`
2. 点击 `创建新版本`
3. 上传 AAB 文件（推荐）或 APK 文件
4. 填写版本说明
5. 点击 `审核`

### 发布应用

1. 完成内容分级问卷
2. 设置价格和分发国家/地区
3. 提交应用以供审核
4. 等待 Google 审核（通常需要几小时到几天）
5. 审核通过后，应用将在 Google Play 商店上线

## CI/CD 自动化部署

持续集成和持续部署 (CI/CD) 可以自动化 Flutter 应用的构建、测试和发布流程，提高开发效率。

### 常用 CI/CD 工具

1. **GitHub Actions**：与 GitHub 仓库无缝集成
2. **Codemagic**：专为 Flutter 应用设计的 CI/CD 平台
3. **Fastlane**：自动化 iOS 和 Android 部署的工具
4. **Bitrise**：移动应用专用的 CI/CD 平台
5. **Jenkins**：通用 CI/CD 服务器

### GitHub Actions 示例

创建 `.github/workflows/flutter-ci.yml` 文件：

```yaml
name: Flutter CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.10.0'

      - name: Get dependencies
        run: flutter pub get

      - name: Run tests
        run: flutter test

      - name: Build APK
        run: flutter build apk --release

      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: release-apk
          path: build/app/outputs/flutter-apk/app-release.apk
```

### Fastlane 自动化

Fastlane 是一个强大的自动化工具，可以处理截图、签名和发布等任务。

#### 安装 Fastlane

```bash
gem install fastlane
```

#### 为 iOS 设置 Fastlane

```bash
cd ios
fastlane init
```

创建 `ios/fastlane/Fastfile`：

```ruby
default_platform(:ios)

platform :ios do
  desc "Push a new beta build to TestFlight"
  lane :beta do
    build_app(workspace: "Runner.xcworkspace", scheme: "Runner")
    upload_to_testflight
  end

  desc "Push a new release build to the App Store"
  lane :release do
    build_app(workspace: "Runner.xcworkspace", scheme: "Runner")
    upload_to_app_store(
      skip_metadata: true,
      skip_screenshots: true
    )
  end
end
```

#### 为 Android 设置 Fastlane

```bash
cd android
fastlane init
```

创建 `android/fastlane/Fastfile`：

```ruby
default_platform(:android)

platform :android do
  desc "Submit a new Beta build to Play Store"
  lane :beta do
    gradle(task: "clean assembleRelease")
    upload_to_play_store(track: 'beta')
  end

  desc "Deploy a new version to the Google Play"
  lane :deploy do
    gradle(task: "clean bundleRelease")
    upload_to_play_store
  end
end
```

### Codemagic 配置

Codemagic 是专为 Flutter 应用设计的 CI/CD 平台，使用非常简便。

创建 `codemagic.yaml` 文件：

```yaml
workflows:
  android-workflow:
    name: Android Workflow
    max_build_duration: 60
    environment:
      flutter: stable
    scripts:
      - flutter packages pub get
      - flutter test
      - flutter build appbundle --release
    artifacts:
      - build/app/outputs/bundle/release/*.aab
    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal

  ios-workflow:
    name: iOS Workflow
    max_build_duration: 60
    environment:
      flutter: stable
      xcode: latest
      cocoapods: default
    scripts:
      - flutter packages pub get
      - flutter test
      - flutter build ios --release --no-codesign
    artifacts:
      - build/ios/ipa/*.ipa
    publishing:
      app_store_connect:
        api_key: $APP_STORE_CONNECT_PRIVATE_KEY
        key_id: $APP_STORE_CONNECT_KEY_ID
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
```

## 版本管理最佳实践

### 语义化版本控制

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 版本更新检查

在应用中实现版本检查功能，提醒用户更新：

```dart
import 'package:package_info_plus/package_info_plus.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> checkForUpdates() async {
  final PackageInfo packageInfo = await PackageInfo.fromPlatform();
  final currentVersion = packageInfo.version;

  // 从服务器获取最新版本
  final response = await http.get(Uri.parse('https://myapi.com/app/version'));
  final latestVersion = json.decode(response.body)['version'];

  if (latestVersion != currentVersion) {
    // 显示更新提示
    showUpdateDialog();
  }
}
```

## 应用内更新

### Android 应用内更新

使用 Google Play 的应用内更新 API：

```dart
import 'package:in_app_update/in_app_update.dart';

Future<void> checkForInAppUpdate() async {
  final InAppUpdate inAppUpdate = InAppUpdate();
  final AppUpdateInfo updateInfo = await inAppUpdate.checkForUpdate();

  if (updateInfo.updateAvailability == UpdateAvailability.updateAvailable) {
    if (updateInfo.immediateUpdateAllowed) {
      // 立即更新
      inAppUpdate.performImmediateUpdate();
    } else if (updateInfo.flexibleUpdateAllowed) {
      // 灵活更新
      inAppUpdate.startFlexibleUpdate();
    }
  }
}
```

## 最佳实践总结

1. **安全管理签名密钥**：妥善保管签名密钥，避免丢失
2. **自动化发布流程**：使用 CI/CD 工具自动化构建和发布
3. **渐进式发布**：先发布到内部测试渠道，再逐步扩大发布范围
4. **监控崩溃报告**：集成崩溃报告工具，及时修复问题
5. **版本号管理**：遵循语义化版本规范，便于用户理解更新内容
6. **发布说明**：提供详细的发布说明，说明新功能和修复的问题
7. **备份重要文件**：备份签名密钥、证书等重要文件

## 练习

1. 为 Flutter 应用创建签名密钥并配置签名信息
2. 构建一个发布版本的 APK 或 App Bundle
3. 设置 GitHub Actions 或其他 CI/CD 工具自动构建应用
4. 模拟一次完整的应用发布流程
5. 实现应用内版本检查和更新提醒功能

## 参考资源

- [Flutter 官方发布文档](https://flutter.dev/docs/deployment/android)
- [App Store 审核指南](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play 开发者政策](https://play.google.com/about/developer-content-policy/)
- [Fastlane 文档](https://docs.fastlane.tools/)
- [Codemagic 文档](https://docs.codemagic.io/flutter-configuration/flutter-projects/)
