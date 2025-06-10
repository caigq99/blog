# Flutter 网络与数据

在移动应用开发中，与服务器交互获取和发送数据是最常见的需求之一。Flutter 提供了多种方式来处理网络请求和数据交互。本文将介绍 Flutter 中的 HTTP 请求、RESTful API 交互、JSON 解析与序列化以及 GraphQL 基础。

## HTTP 请求

Flutter 应用可以使用`http`包来发送 HTTP 请求。这是 Flutter 团队维护的官方包，简单易用。

### 安装 http 包

在`pubspec.yaml`文件中添加依赖：

```yaml
dependencies:
  http: ^1.1.0
```

然后运行：

```bash
flutter pub get
```

### 基本用法

#### GET 请求

```dart
import 'package:http/http.dart' as http;

Future<void> fetchData() async {
  final url = Uri.parse('https://jsonplaceholder.typicode.com/posts');

  try {
    // 发送GET请求
    final response = await http.get(url);

    // 检查状态码
    if (response.statusCode == 200) {
      // 请求成功，处理响应数据
      print('Response body: ${response.body}');
    } else {
      // 请求失败
      print('Request failed with status: ${response.statusCode}');
    }
  } catch (e) {
    // 发生错误
    print('Error: $e');
  }
}
```

#### 添加请求头

```dart
Future<void> fetchDataWithHeaders() async {
  final url = Uri.parse('https://api.example.com/data');

  // 设置请求头
  final headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_token_here',
  };

  final response = await http.get(url, headers: headers);
  // 处理响应...
}
```

#### POST 请求

```dart
Future<void> createPost() async {
  final url = Uri.parse('https://jsonplaceholder.typicode.com/posts');

  // POST请求体
  final body = {
    'title': '测试标题',
    'body': '测试内容',
    'userId': 1,
  };

  try {
    // 发送POST请求
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json; charset=UTF-8'},
      body: jsonEncode(body), // 将Map转换为JSON字符串
    );

    if (response.statusCode == 201) {
      // 创建成功
      print('Created post: ${response.body}');
    } else {
      print('Failed to create post: ${response.statusCode}');
    }
  } catch (e) {
    print('Error: $e');
  }
}
```

#### PUT 请求

```dart
Future<void> updatePost(int id) async {
  final url = Uri.parse('https://jsonplaceholder.typicode.com/posts/$id');

  final body = {
    'id': id,
    'title': '更新的标题',
    'body': '更新的内容',
    'userId': 1,
  };

  final response = await http.put(
    url,
    headers: {'Content-Type': 'application/json; charset=UTF-8'},
    body: jsonEncode(body),
  );

  // 处理响应...
}
```

#### DELETE 请求

```dart
Future<void> deletePost(int id) async {
  final url = Uri.parse('https://jsonplaceholder.typicode.com/posts/$id');

  final response = await http.delete(url);

  if (response.statusCode == 200) {
    print('Post deleted successfully');
  } else {
    print('Failed to delete post: ${response.statusCode}');
  }
}
```

### 处理超时

```dart
Future<void> fetchWithTimeout() async {
  final url = Uri.parse('https://jsonplaceholder.typicode.com/posts');

  try {
    final response = await http.get(url).timeout(
      Duration(seconds: 5),
      onTimeout: () {
        // 超时处理
        throw Exception('Request timed out');
      },
    );

    // 处理响应...
  } catch (e) {
    print('Error: $e');
  }
}
```

### 使用 http 客户端

对于需要共享配置的多个请求，可以创建一个 http 客户端：

```dart
import 'package:http/http.dart' as http;

class ApiClient {
  final http.Client _client = http.Client();
  final String _baseUrl = 'https://api.example.com';

  Future<http.Response> get(String path, {Map<String, String>? headers}) {
    final url = Uri.parse('$_baseUrl$path');
    return _client.get(url, headers: headers);
  }

  Future<http.Response> post(
    String path,
    {Map<String, String>? headers, Object? body}
  ) {
    final url = Uri.parse('$_baseUrl$path');
    return _client.post(url, headers: headers, body: body);
  }

  void dispose() {
    _client.close();
  }
}
```

## RESTful API 交互

RESTful API 是一种基于 HTTP 协议的 API 设计风格，它使用标准的 HTTP 方法（GET、POST、PUT、DELETE 等）来执行操作。

### 创建一个 RESTful API 服务

以下是一个封装 RESTful API 调用的服务示例：

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiResponse<T> {
  final T? data;
  final String? error;
  final int statusCode;

  ApiResponse({this.data, this.error, required this.statusCode});

  bool get isSuccess => statusCode >= 200 && statusCode < 300;
}

class ApiService {
  final String baseUrl;
  final http.Client client = http.Client();

  ApiService(this.baseUrl);

  // 通用GET请求
  Future<ApiResponse<T>> get<T>(
    String endpoint,
    T Function(dynamic json) fromJson, {
    Map<String, String>? headers,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final response = await client.get(url, headers: headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final jsonData = json.decode(response.body);
        return ApiResponse(
          data: fromJson(jsonData),
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse(
          error: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse(
        error: e.toString(),
        statusCode: 500,
      );
    }
  }

  // 通用POST请求
  Future<ApiResponse<T>> post<T>(
    String endpoint,
    dynamic body,
    T Function(dynamic json) fromJson, {
    Map<String, String>? headers,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final response = await client.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          ...?headers,
        },
        body: jsonEncode(body),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final jsonData = json.decode(response.body);
        return ApiResponse(
          data: fromJson(jsonData),
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse(
          error: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse(
        error: e.toString(),
        statusCode: 500,
      );
    }
  }

  // 类似地实现PUT、DELETE等方法...

  void dispose() {
    client.close();
  }
}
```

### 使用 API 服务

```dart
// 定义模型类
class Post {
  final int id;
  final String title;
  final String body;

  Post({required this.id, required this.title, required this.body});

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'],
      title: json['title'],
      body: json['body'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
    };
  }
}

// 创建API服务实例
final apiService = ApiService('https://jsonplaceholder.typicode.com');

// 获取单个帖子
Future<void> fetchPost(int id) async {
  final response = await apiService.get<Post>(
    '/posts/$id',
    (json) => Post.fromJson(json),
  );

  if (response.isSuccess) {
    print('Post: ${response.data?.title}');
  } else {
    print('Error: ${response.error}');
  }
}

// 获取帖子列表
Future<void> fetchPosts() async {
  final response = await apiService.get<List<Post>>(
    '/posts',
    (json) => (json as List).map((item) => Post.fromJson(item)).toList(),
  );

  if (response.isSuccess) {
    final posts = response.data;
    print('Fetched ${posts?.length} posts');
  } else {
    print('Error: ${response.error}');
  }
}

// 创建新帖子
Future<void> createPost(Post post) async {
  final response = await apiService.post<Post>(
    '/posts',
    post.toJson(),
    (json) => Post.fromJson(json),
  );

  if (response.isSuccess) {
    print('Created post with id: ${response.data?.id}');
  } else {
    print('Error: ${response.error}');
  }
}
```

### 处理认证

许多 RESTful API 需要认证，以下是处理令牌认证的示例：

```dart
class AuthApiService extends ApiService {
  String? _authToken;

  AuthApiService(String baseUrl) : super(baseUrl);

  // 设置认证令牌
  set authToken(String? token) {
    _authToken = token;
  }

  // 获取带有认证头的请求头
  Map<String, String> get _authHeaders {
    final headers = <String, String>{};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // 重写GET方法以添加认证
  @override
  Future<ApiResponse<T>> get<T>(
    String endpoint,
    T Function(dynamic json) fromJson, {
    Map<String, String>? headers,
  }) {
    return super.get(
      endpoint,
      fromJson,
      headers: {..._authHeaders, ...?headers},
    );
  }

  // 同样重写其他方法...

  // 登录方法
  Future<bool> login(String username, String password) async {
    final response = await super.post<Map<String, dynamic>>(
      '/login',
      {'username': username, 'password': password},
      (json) => json,
    );

    if (response.isSuccess && response.data != null) {
      authToken = response.data!['token'];
      return true;
    }
    return false;
  }

  // 注销方法
  void logout() {
    authToken = null;
  }
}
```

### 使用 Dio 包

除了官方的`http`包，`dio`是另一个功能更强大的 HTTP 客户端库：

```dart
// 添加依赖
// dependencies:
//   dio: ^5.3.2

import 'package:dio/dio.dart';

class DioClient {
  late Dio _dio;

  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: Duration(seconds: 5),
      receiveTimeout: Duration(seconds: 3),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // 添加拦截器
    _dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  // GET请求
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  // POST请求
  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  // 添加认证拦截器
  void addAuthInterceptor(String token) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          options.headers['Authorization'] = 'Bearer $token';
          return handler.next(options);
        },
      ),
    );
  }
}

// 使用示例
final dioClient = DioClient();

Future<void> fetchUserProfile() async {
  try {
    final response = await dioClient.get('/user/profile');
    print('User profile: ${response.data}');
  } on DioException catch (e) {
    if (e.response != null) {
      print('Dio error: ${e.response?.statusCode} - ${e.response?.statusMessage}');
    } else {
      print('Error sending request: ${e.message}');
    }
  }
}
```

Dio 包提供了许多高级功能，如：

- 请求/响应拦截器
- FormData 支持
- 请求取消
- 文件下载/上传进度
- 超时设置
- 自定义适配器
- 更好的错误处理

## JSON 解析与序列化

在 Flutter 应用中，JSON 是最常用的数据交换格式。Flutter 提供了多种方式来处理 JSON 数据。

### 手动解析 JSON

Dart 内置了`dart:convert`库，可以用于基本的 JSON 解析：

```dart
import 'dart:convert';

// JSON字符串转换为Dart对象
void parseJsonManually() {
  // JSON字符串
  String jsonString = '''
  {
    "id": 1,
    "title": "Hello",
    "content": "World",
    "tags": ["flutter", "dart"],
    "author": {
      "name": "John",
      "email": "john@example.com"
    }
  }
  ''';

  // 解析JSON
  Map<String, dynamic> jsonMap = jsonDecode(jsonString);

  // 访问JSON数据
  print('ID: ${jsonMap['id']}');
  print('Title: ${jsonMap['title']}');
  print('First tag: ${jsonMap['tags'][0]}');
  print('Author name: ${jsonMap['author']['name']}');

  // 修改数据
  jsonMap['title'] = 'Updated Title';

  // 转换回JSON字符串
  String updatedJsonString = jsonEncode(jsonMap);
  print('Updated JSON: $updatedJsonString');
}
```

### 创建模型类

对于复杂的 JSON 数据，最好创建模型类来表示数据结构：

```dart
class Article {
  final int id;
  final String title;
  final String content;
  final List<String> tags;
  final Author author;

  Article({
    required this.id,
    required this.title,
    required this.content,
    required this.tags,
    required this.author,
  });

  // 从JSON创建对象
  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      tags: List<String>.from(json['tags']),
      author: Author.fromJson(json['author']),
    );
  }

  // 转换为JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'tags': tags,
      'author': author.toJson(),
    };
  }
}

class Author {
  final String name;
  final String email;

  Author({required this.name, required this.email});

  factory Author.fromJson(Map<String, dynamic> json) {
    return Author(
      name: json['name'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
    };
  }
}
```

使用模型类：

```dart
void useArticleModel() {
  String jsonString = '...'; // JSON字符串

  // 解析JSON为模型对象
  Map<String, dynamic> jsonMap = jsonDecode(jsonString);
  Article article = Article.fromJson(jsonMap);

  // 使用模型对象
  print('Article title: ${article.title}');
  print('Author: ${article.author.name}');

  // 序列化为JSON
  Map<String, dynamic> articleJson = article.toJson();
  String serialized = jsonEncode(articleJson);
}
```

### 使用代码生成简化 JSON 序列化

手动编写序列化代码容易出错且繁琐。Flutter 提供了代码生成工具来自动处理 JSON 序列化。

1. 添加依赖：

```yaml
dependencies:
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
```

2. 创建模型类：

```dart
import 'package:json_annotation/json_annotation.dart';

// 这个文件会由json_serializable包生成
part 'user.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String name;

  @JsonKey(name: 'email_address')
  final String email;

  @JsonKey(defaultValue: false)
  final bool isActive;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.isActive,
  });

  // 从JSON创建User
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  // 转换User为JSON
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

3. 运行代码生成命令：

```bash
flutter pub run build_runner build
```

或者在开发过程中使用 watch 命令自动生成代码：

```bash
flutter pub run build_runner watch
```

4. 使用生成的代码：

```dart
void useGeneratedCode() {
  String jsonString = '{"id": 1, "name": "John", "email_address": "john@example.com", "isActive": true}';

  // 解析JSON
  Map<String, dynamic> jsonMap = jsonDecode(jsonString);
  User user = User.fromJson(jsonMap);

  // 使用对象
  print('User: ${user.name}, Email: ${user.email}');

  // 序列化为JSON
  String serialized = jsonEncode(user.toJson());
}
```

### 嵌套对象和列表

处理复杂的嵌套 JSON 结构：

```dart
@JsonSerializable(explicitToJson: true)
class Department {
  final String name;

  @JsonKey(name: 'employees')
  final List<Employee> staff;

  Department({required this.name, required this.staff});

  factory Department.fromJson(Map<String, dynamic> json) => _$DepartmentFromJson(json);
  Map<String, dynamic> toJson() => _$DepartmentToJson(this);
}

@JsonSerializable()
class Employee {
  final String name;
  final String position;

  Employee({required this.name, required this.position});

  factory Employee.fromJson(Map<String, dynamic> json) => _$EmployeeFromJson(json);
  Map<String, dynamic> toJson() => _$EmployeeToJson(this);
}
```

注意`explicitToJson: true`参数，它确保嵌套对象也被正确序列化。

## GraphQL 基础

GraphQL 是一种用于 API 的查询语言，它提供了一种更灵活的方式来请求和操作数据。

### 什么是 GraphQL？

GraphQL 与传统的 REST API 相比有以下优势：

1. **按需获取数据**：客户端可以精确指定需要的数据，避免过度获取或获取不足
2. **单一请求获取多个资源**：可以在一个请求中获取多个相关资源
3. **强类型系统**：API 具有自描述能力，可以提供更好的开发体验
4. **版本控制更简单**：可以添加新字段而不影响现有查询

### 在 Flutter 中使用 GraphQL

Flutter 中最常用的 GraphQL 客户端是`graphql_flutter`。

1. 添加依赖：

```yaml
dependencies:
  graphql_flutter: ^5.1.2
```

2. 设置 GraphQL 客户端：

```dart
import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

void main() async {
  // 初始化缓存
  await initHiveForFlutter();

  final HttpLink httpLink = HttpLink('https://api.github.com/graphql');

  // 添加认证
  final AuthLink authLink = AuthLink(
    getToken: () => 'Bearer YOUR_GITHUB_TOKEN',
  );

  // 创建链接
  final Link link = authLink.concat(httpLink);

  // 创建GraphQL客户端
  final GraphQLClient client = GraphQLClient(
    cache: GraphQLCache(store: HiveStore()),
    link: link,
  );

  // 包装应用
  runApp(
    GraphQLProvider(
      client: client,
      child: MyApp(),
    ),
  );
}
```

3. 执行查询：

```dart
class RepositoryList extends StatelessWidget {
  // 定义GraphQL查询
  final String readRepositories = """
    query ReadRepositories(\$nRepositories: Int!) {
      viewer {
        repositories(last: \$nRepositories) {
          nodes {
            id
            name
            viewerHasStarred
            stargazers {
              totalCount
            }
          }
        }
      }
    }
  """;

  @override
  Widget build(BuildContext context) {
    return Query(
      options: QueryOptions(
        document: gql(readRepositories),
        variables: {'nRepositories': 10},
      ),
      builder: (QueryResult result, {VoidCallback? refetch, FetchMore? fetchMore}) {
        if (result.hasException) {
          return Text('Error: ${result.exception.toString()}');
        }

        if (result.isLoading) {
          return CircularProgressIndicator();
        }

        // 解析结果
        List repositories = result.data!['viewer']['repositories']['nodes'];

        return ListView.builder(
          itemCount: repositories.length,
          itemBuilder: (context, index) {
            final repository = repositories[index];
            return ListTile(
              title: Text(repository['name']),
              subtitle: Text('Stars: ${repository['stargazers']['totalCount']}'),
              trailing: repository['viewerHasStarred']
                ? Icon(Icons.star)
                : Icon(Icons.star_border),
            );
          },
        );
      },
    );
  }
}
```

4. 执行变更（Mutation）：

```dart
class StarRepository extends StatelessWidget {
  final String addStar = """
    mutation AddStar(\$repositoryId: ID!) {
      addStar(input: {starrableId: \$repositoryId}) {
        starrable {
          stargazers {
            totalCount
          }
          viewerHasStarred
        }
      }
    }
  """;

  final String repositoryId;

  StarRepository({required this.repositoryId});

  @override
  Widget build(BuildContext context) {
    return Mutation(
      options: MutationOptions(
        document: gql(addStar),
        variables: {'repositoryId': repositoryId},
      ),
      builder: (RunMutation runMutation, QueryResult? result) {
        return ElevatedButton(
          onPressed: () => runMutation({'repositoryId': repositoryId}),
          child: Text('Star Repository'),
        );
      },
      onCompleted: (dynamic resultData) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Repository starred!')),
        );
      },
    );
  }
}
```

### GraphQL 片段

片段是 GraphQL 中可重用的单元，用于共享字段集：

```dart
const String repositoryFragment = """
  fragment RepositoryFields on Repository {
    id
    name
    description
    stargazers {
      totalCount
    }
    viewerHasStarred
  }
""";

const String viewerRepositories = """
  $repositoryFragment
  query ViewerRepositories {
    viewer {
      repositories(first: 10) {
        nodes {
          ...RepositoryFields
        }
      }
    }
  }
""";
```

### GraphQL 订阅

GraphQL 还支持实时数据订阅：

```dart
final WebSocketLink websocketLink = WebSocketLink(
  'wss://api.example.com/graphql',
  config: SocketClientConfig(
    autoReconnect: true,
    inactivityTimeout: Duration(seconds: 30),
  ),
);

const String newMessageSubscription = """
  subscription OnNewMessage {
    messageAdded {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
""";

class ChatRoom extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Subscription(
      options: SubscriptionOptions(
        document: gql(newMessageSubscription),
      ),
      builder: (result) {
        if (result.hasException) {
          return Text('Error: ${result.exception.toString()}');
        }

        if (result.isLoading) {
          return CircularProgressIndicator();
        }

        final message = result.data!['messageAdded'];

        return ListTile(
          title: Text(message['sender']['name']),
          subtitle: Text(message['content']),
          trailing: Text(message['createdAt']),
        );
      },
    );
  }
}
```

### GraphQL 缓存

`graphql_flutter`提供了强大的缓存功能：

```dart
final GraphQLClient client = GraphQLClient(
  cache: GraphQLCache(
    store: HiveStore(),
    // 配置默认缓存策略
    defaultPolicies: DefaultPolicies(
      query: Policies(
        fetch: FetchPolicy.cacheAndNetwork,
        error: ErrorPolicy.ignore,
      ),
      mutation: Policies(
        fetch: FetchPolicy.networkOnly,
        error: ErrorPolicy.all,
      ),
      subscription: Policies(
        fetch: FetchPolicy.networkOnly,
        error: ErrorPolicy.all,
      ),
    ),
  ),
  link: link,
);
```

缓存策略选项：

- `cacheFirst`：先尝试从缓存获取，如果没有再从网络获取
- `cacheAndNetwork`：先从缓存获取，然后从网络获取并更新缓存
- `networkOnly`：只从网络获取，忽略缓存
- `cacheOnly`：只从缓存获取，不进行网络请求

## 小结

在 Flutter 应用开发中，网络与数据处理是非常重要的部分。本文介绍了：

1. **HTTP 请求**：使用`http`和`dio`包发送各种 HTTP 请求
2. **RESTful API 交互**：创建 API 服务封装常见操作
3. **JSON 解析与序列化**：手动解析和使用代码生成简化 JSON 处理
4. **GraphQL 基础**：使用`graphql_flutter`包执行查询、变更和订阅

选择合适的网络请求方式和数据处理方法，可以使 Flutter 应用更加高效、可维护。根据项目需求，可以选择 REST API 或 GraphQL，并采用适当的 JSON 处理策略。
