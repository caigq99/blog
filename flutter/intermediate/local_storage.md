# Flutter 本地存储

在移动应用开发中，本地存储是一个非常重要的功能，它允许应用程序在设备上保存数据，即使在应用关闭后也能保持数据的持久性。Flutter 提供了多种本地存储解决方案，从简单的键值对存储到复杂的关系型数据库。本文将介绍 Flutter 中常用的本地存储方案：SharedPreferences、SQLite、Hive 和文件操作。

## SharedPreferences

SharedPreferences 是一种轻量级的键值对存储方案，适合存储少量的简单数据，如用户设置、登录状态等。它在 iOS 上使用 NSUserDefaults，在 Android 上使用 SharedPreferences。

### 安装

在`pubspec.yaml`文件中添加依赖：

```yaml
dependencies:
  shared_preferences: ^2.2.1
```

然后运行：

```bash
flutter pub get
```

### 基本用法

#### 存储数据

```dart
import 'package:shared_preferences/shared_preferences.dart';

Future<void> saveData() async {
  // 获取SharedPreferences实例
  final prefs = await SharedPreferences.getInstance();

  // 存储各种类型的数据
  await prefs.setString('username', 'JohnDoe');
  await prefs.setInt('age', 25);
  await prefs.setDouble('height', 175.5);
  await prefs.setBool('isLoggedIn', true);
  await prefs.setStringList('favorites', ['Flutter', 'Dart', 'Mobile']);

  print('数据保存成功');
}
```

#### 读取数据

```dart
Future<void> readData() async {
  final prefs = await SharedPreferences.getInstance();

  // 读取数据，提供默认值以防数据不存在
  final username = prefs.getString('username') ?? 'Guest';
  final age = prefs.getInt('age') ?? 0;
  final height = prefs.getDouble('height') ?? 0.0;
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
  final favorites = prefs.getStringList('favorites') ?? [];

  print('用户名: $username');
  print('年龄: $age');
  print('身高: $height');
  print('是否登录: $isLoggedIn');
  print('收藏: $favorites');
}
```

#### 检查和删除数据

```dart
Future<void> manageData() async {
  final prefs = await SharedPreferences.getInstance();

  // 检查键是否存在
  final hasUsername = prefs.containsKey('username');
  print('是否存在用户名: $hasUsername');

  // 删除特定键
  if (hasUsername) {
    await prefs.remove('username');
    print('用户名已删除');
  }

  // 获取所有键
  final keys = prefs.getKeys();
  print('所有键: $keys');

  // 清除所有数据
  // await prefs.clear();
  // print('所有数据已清除');
}
```

### 在 Flutter 应用中使用 SharedPreferences

一个简单的设置页面示例：

```dart
class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _notificationsEnabled = false;
  bool _darkModeEnabled = false;
  String _username = '';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  // 加载设置
  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? false;
      _darkModeEnabled = prefs.getBool('dark_mode_enabled') ?? false;
      _username = prefs.getString('username') ?? '';
    });
  }

  // 保存设置
  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notifications_enabled', _notificationsEnabled);
    await prefs.setBool('dark_mode_enabled', _darkModeEnabled);
    await prefs.setString('username', _username);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('设置已保存')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('设置')),
      body: ListView(
        padding: EdgeInsets.all(16.0),
        children: [
          TextField(
            decoration: InputDecoration(labelText: '用户名'),
            controller: TextEditingController(text: _username),
            onChanged: (value) => _username = value,
          ),
          SwitchListTile(
            title: Text('启用通知'),
            value: _notificationsEnabled,
            onChanged: (value) {
              setState(() {
                _notificationsEnabled = value;
              });
            },
          ),
          SwitchListTile(
            title: Text('深色模式'),
            value: _darkModeEnabled,
            onChanged: (value) {
              setState(() {
                _darkModeEnabled = value;
              });
            },
          ),
          ElevatedButton(
            onPressed: _saveSettings,
            child: Text('保存设置'),
          ),
        ],
      ),
    );
  }
}
```

### SharedPreferences 的限制

- 只能存储基本数据类型（String、int、double、bool、List<String>）
- 不适合存储大量数据或复杂结构
- 不支持加密（数据以明文形式存储）

## SQLite 数据库

SQLite 是一个轻量级的关系型数据库，适合存储结构化数据。Flutter 通过`sqflite`包提供对 SQLite 的支持。

### 安装

在`pubspec.yaml`文件中添加依赖：

```yaml
dependencies:
  sqflite: ^2.3.0
  path: ^1.8.3
```

然后运行：

```bash
flutter pub get
```

### 基本用法

#### 创建数据库和表

```dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;

  factory DatabaseHelper() {
    return _instance;
  }

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;

    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    // 获取数据库路径
    String path = join(await getDatabasesPath(), 'my_database.db');

    // 打开/创建数据库
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDb,
    );
  }

  Future<void> _createDb(Database db, int version) async {
    // 创建表
    await db.execute('''
      CREATE TABLE users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        age INTEGER
      )
    ''');

    await db.execute('''
      CREATE TABLE notes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        created_at TEXT,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    ''');
  }
}
```

#### 插入数据

```dart
class User {
  int? id;
  String name;
  String email;
  int age;

  User({
    this.id,
    required this.name,
    required this.email,
    required this.age,
  });

  // 将User对象转换为Map
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'age': age,
    };
  }

  // 从Map创建User对象
  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'],
      name: map['name'],
      email: map['email'],
      age: map['age'],
    );
  }
}

class UserRepository {
  final dbHelper = DatabaseHelper();

  // 插入用户
  Future<int> insertUser(User user) async {
    final db = await dbHelper.database;
    return await db.insert(
      'users',
      user.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
}
```

使用示例：

```dart
final userRepo = UserRepository();
final user = User(
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
);

final userId = await userRepo.insertUser(user);
print('插入的用户ID: $userId');
```

#### 查询数据

```dart
class UserRepository {
  // ...

  // 获取所有用户
  Future<List<User>> getUsers() async {
    final db = await dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query('users');

    return List.generate(maps.length, (i) {
      return User.fromMap(maps[i]);
    });
  }

  // 根据ID获取用户
  Future<User?> getUserById(int id) async {
    final db = await dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'users',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;
    return User.fromMap(maps.first);
  }

  // 条件查询
  Future<List<User>> getUsersByAge(int minAge) async {
    final db = await dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'users',
      where: 'age >= ?',
      whereArgs: [minAge],
      orderBy: 'age DESC',
    );

    return List.generate(maps.length, (i) {
      return User.fromMap(maps[i]);
    });
  }
}
```

#### 更新数据

```dart
class UserRepository {
  // ...

  // 更新用户
  Future<int> updateUser(User user) async {
    final db = await dbHelper.database;
    return await db.update(
      'users',
      user.toMap(),
      where: 'id = ?',
      whereArgs: [user.id],
    );
  }
}
```

使用示例：

```dart
// 获取用户
User? user = await userRepo.getUserById(1);
if (user != null) {
  // 修改数据
  user.age = 31;

  // 更新数据库
  final count = await userRepo.updateUser(user);
  print('更新的行数: $count');
}
```

#### 删除数据

```dart
class UserRepository {
  // ...

  // 删除用户
  Future<int> deleteUser(int id) async {
    final db = await dbHelper.database;
    return await db.delete(
      'users',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // 删除所有用户
  Future<int> deleteAllUsers() async {
    final db = await dbHelper.database;
    return await db.delete('users');
  }
}
```

#### 执行原始 SQL 查询

```dart
Future<void> executeRawQuery() async {
  final db = await dbHelper.database;

  // 执行原始SQL查询
  List<Map<String, dynamic>> result = await db.rawQuery('''
    SELECT users.name, COUNT(notes.id) as note_count
    FROM users
    LEFT JOIN notes ON users.id = notes.user_id
    GROUP BY users.id
    HAVING note_count > 0
  ''');

  for (var row in result) {
    print('${row['name']} 有 ${row['note_count']} 条笔记');
  }
}
```

#### 事务处理

```dart
Future<void> performTransaction() async {
  final db = await dbHelper.database;

  await db.transaction((txn) async {
    // 在事务中执行多个操作
    int userId = await txn.insert(
      'users',
      User(name: 'Alice', email: 'alice@example.com', age: 28).toMap(),
    );

    await txn.insert(
      'notes',
      {
        'title': '欢迎笔记',
        'content': '欢迎使用我们的应用！',
        'created_at': DateTime.now().toIso8601String(),
        'user_id': userId,
      },
    );
  });
}
```

### 使用 SQLite 的最佳实践

1. **使用单例模式管理数据库连接**：避免多次打开数据库连接
2. **定义清晰的模型类**：使用模型类表示数据库实体
3. **使用事务处理批量操作**：提高性能并确保数据一致性
4. **正确处理数据库迁移**：在`onUpgrade`回调中处理数据库版本升级
5. **关闭数据库连接**：在不需要时关闭数据库连接

```dart
// 数据库迁移示例
Future<Database> _initDatabase() async {
  String path = join(await getDatabasesPath(), 'my_database.db');

  return await openDatabase(
    path,
    version: 2, // 新版本
    onCreate: _createDb,
    onUpgrade: _upgradeDb,
  );
}

Future<void> _upgradeDb(Database db, int oldVersion, int newVersion) async {
  if (oldVersion == 1 && newVersion == 2) {
    // 版本1升级到版本2
    await db.execute('ALTER TABLE users ADD COLUMN phone_number TEXT');
  }
}
```

## Hive NoSQL 数据库

Hive 是一个轻量级、高性能的 NoSQL 数据库，完全用 Dart 编写，不依赖原生平台。它特别适合存储简单对象，性能优于 SQLite。

### 安装

在`pubspec.yaml`文件中添加依赖：

```yaml
dependencies:
  hive: ^2.2.3
  hive_flutter: ^1.1.0

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.6
```

然后运行：

```bash
flutter pub get
```

### 基本用法

#### 初始化 Hive

```dart
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

Future<void> initHive() async {
  // 初始化Hive并设置应用文档目录
  await Hive.initFlutter();

  // 注册适配器（如果使用自定义对象）
  Hive.registerAdapter(PersonAdapter());

  // 打开盒子（类似于表或集合）
  await Hive.openBox('settings');
  await Hive.openBox<Person>('persons');
}
```

#### 定义 Hive 对象

使用`@HiveType`注解定义 Hive 对象：

```dart
import 'package:hive/hive.dart';

part 'person.g.dart'; // 将由build_runner生成

@HiveType(typeId: 0)
class Person {
  @HiveField(0)
  String name;

  @HiveField(1)
  int age;

  @HiveField(2)
  List<String> hobbies;

  Person({
    required this.name,
    required this.age,
    required this.hobbies,
  });
}
```

运行代码生成命令：

```bash
flutter pub run build_runner build
```

#### 存储和检索数据

```dart
// 获取盒子引用
final settingsBox = Hive.box('settings');
final personsBox = Hive.box<Person>('persons');

// 存储基本类型
await settingsBox.put('username', 'JohnDoe');
await settingsBox.put('isDarkMode', true);
await settingsBox.put('lastLogin', DateTime.now().toIso8601String());

// 存储自定义对象
final person = Person(
  name: 'Alice',
  age: 28,
  hobbies: ['Reading', 'Hiking', 'Coding'],
);
await personsBox.put('alice', person);

// 使用自动生成的键
final id = await personsBox.add(person); // 返回自动生成的键

// 读取数据
final username = settingsBox.get('username', defaultValue: 'Guest');
final isDarkMode = settingsBox.get('isDarkMode', defaultValue: false);

// 读取自定义对象
final alice = personsBox.get('alice');
print('${alice.name} is ${alice.age} years old');
print('Hobbies: ${alice.hobbies.join(', ')}');
```

#### 更新和删除数据

```dart
// 更新数据
await settingsBox.put('username', 'JaneDoe'); // 覆盖现有值

// 更新自定义对象
final alice = personsBox.get('alice');
alice.age = 29;
await personsBox.put('alice', alice);

// 删除数据
await settingsBox.delete('lastLogin');
await personsBox.delete('alice');
```

#### 监听变化

```dart
// 监听特定键的变化
settingsBox.watch(key: 'isDarkMode').listen((event) {
  print('isDarkMode changed: ${event.value}');
});

// 监听所有变化
personsBox.listenable().addListener(() {
  print('Persons box changed');
});
```

#### 在 Flutter UI 中使用 Hive

使用`ValueListenableBuilder`响应 Hive 数据变化：

```dart
class SettingsView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final settingsBox = Hive.box('settings');

    return ValueListenableBuilder(
      valueListenable: settingsBox.listenable(keys: ['isDarkMode']),
      builder: (context, Box box, _) {
        final isDarkMode = box.get('isDarkMode', defaultValue: false);

        return SwitchListTile(
          title: Text('深色模式'),
          value: isDarkMode,
          onChanged: (value) {
            box.put('isDarkMode', value);
          },
        );
      },
    );
  }
}
```

显示 Hive 对象列表：

```dart
class PersonListView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final personsBox = Hive.box<Person>('persons');

    return ValueListenableBuilder(
      valueListenable: personsBox.listenable(),
      builder: (context, Box<Person> box, _) {
        if (box.isEmpty) {
          return Center(child: Text('没有数据'));
        }

        return ListView.builder(
          itemCount: box.length,
          itemBuilder: (context, index) {
            final person = box.getAt(index);
            final key = box.keyAt(index);

            return ListTile(
              title: Text(person!.name),
              subtitle: Text('${person.age}岁 • ${person.hobbies.join(', ')}'),
              trailing: IconButton(
                icon: Icon(Icons.delete),
                onPressed: () {
                  box.deleteAt(index);
                },
              ),
            );
          },
        );
      },
    );
  }
}
```

### Hive 的优势和限制

**优势**：

- 高性能（比 SQLite 快）
- 简单易用
- 纯 Dart 实现，无平台依赖
- 支持懒加载
- 类型安全

**限制**：

- 不支持复杂查询和过滤
- 不适合大规模关系型数据
- 所有数据都加载到内存中（除非使用懒加载盒子）

## 文件操作

Flutter 提供了文件系统访问功能，可以直接读写文件。这对于存储大型数据（如图片、文档等）特别有用。

### 获取应用文档目录

```dart
import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<Directory> getAppDirectory() async {
  // 获取应用文档目录
  final directory = await getApplicationDocumentsDirectory();
  return directory;
}

Future<String> getFilePath(String fileName) async {
  final dir = await getAppDirectory();
  return '${dir.path}/$fileName';
}
```

### 写入文件

```dart
Future<File> writeFile(String fileName, String content) async {
  final path = await getFilePath(fileName);
  final file = File(path);

  // 写入文件
  return await file.writeAsString(content);
}

// 写入二进制数据
Future<File> writeBinaryFile(String fileName, List<int> bytes) async {
  final path = await getFilePath(fileName);
  final file = File(path);

  return await file.writeAsBytes(bytes);
}
```

### 读取文件

```dart
Future<String> readFile(String fileName) async {
  try {
    final path = await getFilePath(fileName);
    final file = File(path);

    // 检查文件是否存在
    if (await file.exists()) {
      // 读取文件内容
      return await file.readAsString();
    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
}

// 读取二进制数据
Future<List<int>> readBinaryFile(String fileName) async {
  try {
    final path = await getFilePath(fileName);
    final file = File(path);

    if (await file.exists()) {
      return await file.readAsBytes();
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
}
```

### 检查和删除文件

```dart
Future<bool> fileExists(String fileName) async {
  final path = await getFilePath(fileName);
  final file = File(path);
  return await file.exists();
}

Future<void> deleteFile(String fileName) async {
  final path = await getFilePath(fileName);
  final file = File(path);

  if (await file.exists()) {
    await file.delete();
  }
}
```

### 列出目录内容

```dart
Future<List<FileSystemEntity>> listDirectory() async {
  final dir = await getAppDirectory();
  return dir.listSync();
}

Future<void> printDirectoryContents() async {
  final contents = await listDirectory();

  for (var entity in contents) {
    if (entity is File) {
      print('文件: ${entity.path}');
    } else if (entity is Directory) {
      print('目录: ${entity.path}');
    }
  }
}
```

### 创建和操作目录

```dart
Future<Directory> createDirectory(String dirName) async {
  final appDir = await getAppDirectory();
  final newDir = Directory('${appDir.path}/$dirName');

  if (!(await newDir.exists())) {
    return await newDir.create();
  }

  return newDir;
}

Future<void> deleteDirectory(String dirName) async {
  final appDir = await getAppDirectory();
  final dir = Directory('${appDir.path}/$dirName');

  if (await dir.exists()) {
    await dir.delete(recursive: true);
  }
}
```

### 保存和加载图片

```dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

Future<String?> saveImage(XFile image) async {
  try {
    final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
    final bytes = await image.readAsBytes();

    final file = await writeBinaryFile(fileName, bytes);
    return file.path;
  } catch (e) {
    print('保存图片失败: $e');
    return null;
  }
}

Widget displayImage(String imagePath) {
  final file = File(imagePath);

  return Image.file(
    file,
    fit: BoxFit.cover,
  );
}
```

### 实际应用示例：简单的笔记应用

```dart
class Note {
  final String id;
  final String title;
  final String content;
  final DateTime createdAt;

  Note({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class NoteService {
  Future<void> saveNotes(List<Note> notes) async {
    final notesJson = notes.map((note) => note.toJson()).toList();
    final jsonString = jsonEncode(notesJson);

    await writeFile('notes.json', jsonString);
  }

  Future<List<Note>> loadNotes() async {
    try {
      final jsonString = await readFile('notes.json');

      if (jsonString.isEmpty) {
        return [];
      }

      final List<dynamic> jsonList = jsonDecode(jsonString);
      return jsonList.map((json) => Note.fromJson(json)).toList();
    } catch (e) {
      print('加载笔记失败: $e');
      return [];
    }
  }

  Future<void> addNote(Note note) async {
    final notes = await loadNotes();
    notes.add(note);
    await saveNotes(notes);
  }

  Future<void> deleteNote(String id) async {
    final notes = await loadNotes();
    notes.removeWhere((note) => note.id == id);
    await saveNotes(notes);
  }
}
```

## 选择合适的存储方案

根据应用需求选择合适的存储方案：

| 存储方案          | 适用场景                     | 优点                   | 缺点                               |
| ----------------- | ---------------------------- | ---------------------- | ---------------------------------- |
| SharedPreferences | 简单的键值对数据，如用户设置 | 简单易用，适合小数据量 | 只支持基本数据类型，不适合复杂数据 |
| SQLite            | 结构化数据，关系型数据       | 支持复杂查询，事务处理 | 设置较复杂，需要定义模式           |
| Hive              | 简单对象存储，需要高性能     | 高性能，类型安全，易用 | 不支持复杂查询，不适合关系型数据   |
| 文件存储          | 大型数据，如图片、文档       | 完全控制数据格式和存储 | 需要手动管理文件，无结构化查询     |

## 小结

Flutter 提供了多种本地存储方案，从简单的 SharedPreferences 到复杂的 SQLite 数据库。本文介绍了：

1. **SharedPreferences**：轻量级键值对存储，适合简单数据
2. **SQLite**：关系型数据库，适合结构化数据和复杂查询
3. **Hive**：NoSQL 数据库，高性能且易用
4. **文件操作**：直接读写文件，适合大型数据

选择合适的存储方案取决于应用的需求、数据复杂度和性能要求。对于简单的应用，SharedPreferences 或 Hive 可能已经足够；而对于需要复杂查询的应用，SQLite 可能是更好的选择。
