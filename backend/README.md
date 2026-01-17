# WeatherWear 后端 API

天气预报穿衣推荐App的后端服务，基于 Node.js + Express + MySQL + Sequelize。

## 功能特性

- ✅ 用户注册和登录（JWT认证，使用用户名）
- ✅ 天气预报功能（调用OpenWeatherMap API）
- ✅ 衣物管理（添加、查看、编辑、删除、按种类查询）
- ✅ 基于保暖等级和色系的智能推荐（推荐1套完整搭配）
- ✅ 用户个人资料管理（用户名、头像）
- ✅ 收藏套装功能

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web框架
- **MySQL** - 数据库
- **Sequelize** - ORM框架
- **JWT** - 身份认证
- **Multer** - 文件上传
- **Axios** - HTTP客户端
- **雪花算法** - 唯一ID生成

## 项目结构

```
backend/
├── config/          # 配置文件
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── utils/           # 工具函数
├── uploads/         # 上传文件存储
├── server.js        # 入口文件
└── package.json     # 依赖配置
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# 服务器配置
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=weatherwear

# JWT配置
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# 天气API配置
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# 文件上传配置
UPLOAD_MAX_SIZE=5242880
```

### 3. 创建数据库

在MySQL中创建数据库：

```sql
CREATE DATABASE weatherwear CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器启动后，Sequelize 会自动同步数据库表结构。

## API 文档

### 认证相关

#### 用户注册
- **POST** `/api/auth/register`
- **Body**: `{ username, password }`
- **Response**: `{ success, message, data: { token, user } }`

#### 用户登录
- **POST** `/api/auth/login`
- **Body**: `{ username, password }`
- **Response**: `{ success, message, data: { token, user } }`

### 天气相关

#### 获取当前天气
- **GET** `/api/weather/current?city=北京`
- **Response**: `{ success, message, data: { city, temperature, description, ... } }`

#### 获取天气预报
- **GET** `/api/weather/forecast?city=北京`
- **Response**: `{ success, message, data: [...] }`

### 衣物管理（需要认证）

#### 获取用户衣橱
- **GET** `/api/clothes?category=top`（可选：按种类筛选）
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message, data: [...] }`

#### 按种类获取衣物
- **GET** `/api/clothes/category/:category`
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `category` - 种类（top/bottom/shoes/bag/accessory）
- **Response**: `{ success, message, data: [...] }`

#### 添加衣物
- **POST** `/api/clothes`
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `clothes`: `<file>`（图片，必填）
  - `name`: `<string>`（衣物名称，必填）
  - `warmthLevel`: `<number>`（保暖等级1-4，必填）
  - `category`: `<string>`（种类：top/bottom/shoes/bag/accessory，必填）
  - `color`: `<string>`（颜色：白/黑/暖黄棕色/蓝色/红色/其他，必填）
- **Response**: `{ success, message, data: {...} }`

#### 编辑衣物
- **PUT** `/api/clothes/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `name`: `<string>`（可选）
  - `warmthLevel`: `<number>`（可选）
  - `category`: `<string>`（可选）
  - `color`: `<string>`（可选）
  - `clothes`: `<file>`（图片，可选）
- **Response**: `{ success, message, data: {...} }`

#### 获取衣物详情
- **GET** `/api/clothes/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message, data: {...} }`

#### 删除衣物
- **DELETE** `/api/clothes/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message }`

### 推荐功能（需要认证）

#### 获取推荐套装
- **GET** `/api/recommend?city=北京&warmthLevel=2&colorScheme=白`
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**:
  - `city`: 城市名称（可选，提供时会根据天气自动计算保暖等级）
  - `warmthLevel`: 保暖等级1-4（可选，如果提供city则自动计算）
  - `colorScheme`: 色系（可选：白/黑/暖/冷/其他）
- **Response**: `{ success, message, data: { weather, warmthLevel, colorScheme, outfit, availableCount } }`
- **说明**: 返回1套完整搭配（包含top、bottom、shoes等）

### 收藏功能（需要认证）

#### 获取收藏列表
- **GET** `/api/favorite`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message, data: [...] }`

#### 添加收藏
- **POST** `/api/favorite`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  - `outfitData`: `<object>`（套装数据JSON，必填）
  - `warmthLevel`: `<number>`（保暖等级1-4，必填）
  - `colorScheme`: `<string>`（色系描述，可选）
  - `description`: `<string>`（描述，可选）
- **Response**: `{ success, message, data: {...} }`

#### 删除收藏
- **DELETE** `/api/favorite/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message }`

### 用户管理（需要认证）

#### 获取用户信息
- **GET** `/api/user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message, data: {...} }`

#### 更新用户信息
- **PUT** `/api/user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data` (如果上传头像)
- **Body**: 
  - `username`: `<string>`（可选）
  - `avatar`: `<file>`（图片，可选）
- **Response**: `{ success, message, data: {...} }`

## 数据模型

### User (用户)
- id (BIGINT, 雪花ID)
- username (VARCHAR(50), 唯一)
- password (VARCHAR(255), 加密)
- avatar (VARCHAR(255), 可为空)
- createdAt, updatedAt

### Clothes (衣物)
- id (BIGINT, 雪花ID)
- userId (BIGINT, 外键)
- name (VARCHAR(100))
- warmthLevel (TINYINT, 1-4)
- imageUrl (VARCHAR(255))
- category (ENUM: top/bottom/shoes/bag/accessory)
- color (ENUM: 白/黑/暖黄棕色/蓝色/红色/其他)
- createdAt, updatedAt

### FavoriteOutfit (收藏套装)
- id (BIGINT, 雪花ID)
- userId (BIGINT, 外键)
- outfitData (JSON, 套装数据)
- warmthLevel (TINYINT, 1-4)
- colorScheme (VARCHAR(50), 可为空)
- description (TEXT, 可为空)
- createdAt, updatedAt

## 保暖等级说明

- **1级**: 很热（25℃以上）- 适合夏季
- **2级**: 温暖（15-25℃）- 适合春秋
- **3级**: 凉爽（5-15℃）- 适合初冬
- **4级**: 寒冷（5℃以下）- 适合深冬

## 注意事项

1. 确保MySQL服务已启动
2. 需要注册OpenWeatherMap API密钥：https://openweathermap.org/api
3. 上传的文件存储在 `uploads/` 目录下
4. JWT token需要在请求头中携带：`Authorization: Bearer <token>`
5. 用户ID和衣物ID使用雪花算法生成，为字符串类型的大整数
6. 推荐功能会根据保暖等级和色系推荐1套完整搭配（包含top、bottom、shoes等）

## 开发建议

- 使用Postman或类似工具测试API（参考 `test.md`）
- 查看控制台日志了解运行状态
- 开发环境下数据库模型会自动同步
- 查看 `database.md` 了解数据库详细设计
