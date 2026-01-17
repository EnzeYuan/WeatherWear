# Postman API 测试指南

本文档介绍如何使用 Postman 测试 WeatherWear 后端 API 的所有接口。

## 前置准备

1. **启动后端服务器**
   ```bash
   npm run dev
   ```
   确保服务器运行在 `http://localhost:5000`（或你在 `.env` 中配置的端口）

2. **安装 Postman**
   - 下载并安装 Postman 桌面版或使用网页版

3. **创建环境变量（可选但推荐）**
   - 在 Postman 中创建一个新的 Environment
   - 添加变量：
     - `base_url`: `http://localhost:5000`
     - `token`: （登录后会自动设置）

---

## 接口测试流程

### 第一步：用户注册和登录（获取 Token）

#### 1. 用户注册

**请求信息：**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

**预期响应：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1234567890123456789",
      "username": "testuser",
      "avatar": null
    }
  }
}
```

**操作提示：**
- 复制返回的 `token` 值，保存到 Postman 环境变量 `token` 中
- 注意：用户ID是雪花算法生成的字符串（大整数）

---

#### 2. 用户登录

**请求信息：**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

**预期响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1234567890123456789",
      "username": "testuser",
      "avatar": null
    }
  }
}
```

**操作提示：**
- 同样保存 `token` 到环境变量中，后续所有需要认证的接口都需要使用这个 token

---

### 第二步：天气相关接口（无需认证）

#### 3. 获取当前天气

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/weather/current?city=北京`
- **Headers**: 无需特殊 headers

**参数说明：**
- `city`: 城市名称（必填），例如：北京、上海、New York

**预期响应：**
```json
{
  "success": true,
  "message": "获取天气信息成功",
  "data": {
    "city": "北京",
    "temperature": 15,
    "description": "晴天",
    "humidity": 60,
    "windSpeed": 5,
    ...
  }
}
```

---

#### 4. 获取天气预报

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/weather/forecast?city=北京`
- **Headers**: 无需特殊 headers

**参数说明：**
- `city`: 城市名称（必填）

**预期响应：**
```json
{
  "success": true,
  "message": "获取天气预报成功",
  "data": [
    {
      "date": "2024-01-15",
      "temperature": 15,
      "description": "晴天",
      ...
    },
    ...
  ]
}
```

---

### 第三步：用户管理接口（需要认证）

#### 5. 获取用户信息

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/user/profile`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**预期响应：**
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "id": "1234567890123456789",
    "username": "testuser",
    "avatar": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 6. 更新用户信息

**请求信息：**
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/user/profile`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```
  **注意**：如果要上传头像，不要设置 `Content-Type`，Postman 会自动设置为 `multipart/form-data`

- **Body** (form-data):
  - `username`: `新用户名`（可选）
  - `avatar`: （文件类型，选择图片文件，可选）

**示例（仅更新用户名）：**
```
username: newusername
```

**示例（更新头像）：**
```
avatar: [选择文件]
username: newusername
```

**预期响应：**
```json
{
  "success": true,
  "message": "更新用户信息成功",
  "data": {
    "id": "1234567890123456789",
    "username": "newusername",
    "avatar": "http://localhost:5000/uploads/avatars/xxx.jpg",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 第四步：衣物管理接口（需要认证）

#### 7. 获取用户所有衣物

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/clothes` 或 `{{base_url}}/api/clothes?category=top`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**参数说明：**
- `category`: （可选）按种类筛选，可选值：top、bottom、shoes、bag、accessory

**预期响应：**
```json
{
  "success": true,
  "message": "获取衣橱成功",
  "data": [
    {
      "id": "1234567890123456789",
      "userId": "1234567890123456788",
      "name": "白色T恤",
      "warmthLevel": 1,
      "imageUrl": "http://localhost:5000/uploads/clothes/xxx.jpg",
      "category": "top",
      "color": "白",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

---

#### 8. 按种类获取衣物

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/clothes/category/top`
  - 种类可选：top、bottom、shoes、bag、accessory
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**预期响应：**
```json
{
  "success": true,
  "message": "获取衣物成功",
  "data": [
    {
      "id": "1234567890123456789",
      "name": "白色T恤",
      "warmthLevel": 1,
      "category": "top",
      "color": "白",
      ...
    },
    ...
  ]
}
```

---

#### 9. 添加衣物

**请求信息：**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/clothes`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```
  **注意**：不要设置 `Content-Type`，Postman 会自动设置为 `multipart/form-data`

- **Body** (form-data):
  - `clothes`: （文件类型，选择衣物图片，**必填**）
  - `name`: `白色T恤`（字符串，**必填**）
  - `warmthLevel`: `1`（数字，**必填**，取值范围1-4）
  - `category`: `top`（字符串，**必填**，可选值：top/bottom/shoes/bag/accessory）
  - `color`: `白`（字符串，**必填**，可选值：白/黑/暖黄棕色/蓝色/红色/其他）

**字段说明：**
- **warmthLevel（保暖等级）**：
  - 1级：很热（25℃以上）
  - 2级：温暖（15-25℃）
  - 3级：凉爽（5-15℃）
  - 4级：寒冷（5℃以下）
- **category（种类）**：
  - top：上装
  - bottom：下装
  - shoes：鞋子
  - bag：包
  - accessory：配饰
- **color（颜色）**：
  - 白、黑、暖黄棕色、蓝色、红色、其他

**预期响应：**
```json
{
  "success": true,
  "message": "添加衣物成功",
  "data": {
    "id": "1234567890123456790",
    "userId": "1234567890123456788",
    "name": "白色T恤",
    "warmthLevel": 1,
    "imageUrl": "http://localhost:5000/uploads/clothes/xxx.jpg",
    "category": "top",
    "color": "白",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 10. 编辑衣物

**请求信息：**
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/clothes/:id`
  - 例如：`{{base_url}}/api/clothes/1234567890123456790`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```
  **注意**：如果要上传新图片，不要设置 `Content-Type`，Postman 会自动设置为 `multipart/form-data`

- **Body** (form-data 或 x-www-form-urlencoded):
  - `name`: `新名称`（可选）
  - `warmthLevel`: `2`（可选）
  - `category`: `top`（可选）
  - `color`: `黑`（可选）
  - `clothes`: （文件类型，选择新图片，可选）

**预期响应：**
```json
{
  "success": true,
  "message": "编辑衣物成功",
  "data": {
    "id": "1234567890123456790",
    "name": "新名称",
    "warmthLevel": 2,
    "category": "top",
    "color": "黑",
    ...
  }
}
```

---

#### 11. 获取单个衣物详情

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/clothes/:id`
  - 例如：`{{base_url}}/api/clothes/1234567890123456790`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**参数说明：**
- `id`: 衣物ID（URL路径参数）

**预期响应：**
```json
{
  "success": true,
  "message": "获取衣物详情成功",
  "data": {
    "id": "1234567890123456790",
    "userId": "1234567890123456788",
    "name": "白色T恤",
    "warmthLevel": 1,
    "imageUrl": "http://localhost:5000/uploads/clothes/xxx.jpg",
    "category": "top",
    "color": "白",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 12. 删除衣物

**请求信息：**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/clothes/:id`
  - 例如：`{{base_url}}/api/clothes/1234567890123456790`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**参数说明：**
- `id`: 衣物ID（URL路径参数）

**预期响应：**
```json
{
  "success": true,
  "message": "删除衣物成功"
}
```

---

### 第五步：推荐接口（需要认证）

#### 13. 获取推荐套装

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/recommend?city=北京&warmthLevel=2&colorScheme=白`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**参数说明：**
- `city`: 城市名称（可选，提供时会根据天气自动计算保暖等级）
- `warmthLevel`: 保暖等级1-4（可选，如果提供city则自动计算）
- `colorScheme`: 色系（可选：白/黑/暖/冷/其他）

**说明：**
- 如果提供 `city`，系统会根据当前温度自动计算保暖等级
- 如果同时提供 `city` 和 `warmthLevel`，优先使用 `warmthLevel`
- 推荐结果返回1套完整搭配（包含top、bottom、shoes等）

**预期响应：**
```json
{
  "success": true,
  "message": "推荐成功",
  "data": {
    "weather": {
      "city": "北京",
      "temperature": 15,
      "description": "晴天",
      ...
    },
    "warmthLevel": 2,
    "colorScheme": "白、黑",
    "outfit": {
      "top": {
        "id": "1234567890123456790",
        "name": "白色T恤",
        "warmthLevel": 2,
        "category": "top",
        "color": "白",
        "imageUrl": "http://localhost:5000/uploads/clothes/xxx.jpg",
        ...
      },
      "bottom": {
        "id": "1234567890123456791",
        "name": "黑色牛仔裤",
        "warmthLevel": 2,
        "category": "bottom",
        "color": "黑",
        "imageUrl": "http://localhost:5000/uploads/clothes/yyy.jpg",
        ...
      },
      "shoes": {
        "id": "1234567890123456792",
        "name": "白色运动鞋",
        "warmthLevel": 2,
        "category": "shoes",
        "color": "白",
        "imageUrl": "http://localhost:5000/uploads/clothes/zzz.jpg",
        ...
      }
    },
    "availableCount": 10
  }
}
```

---

### 第六步：收藏接口（需要认证）

#### 14. 获取收藏列表

**请求信息：**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/favorite`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**预期响应：**
```json
{
  "success": true,
  "message": "获取收藏列表成功",
  "data": [
    {
      "id": "1234567890123456800",
      "userId": "1234567890123456788",
      "outfitData": {
        "top": {
          "id": "1234567890123456790",
          "name": "白色T恤",
          "imageUrl": "http://localhost:5000/uploads/clothes/xxx.jpg",
          "category": "top",
          "color": "白"
        },
        "bottom": {
          "id": "1234567890123456791",
          "name": "黑色牛仔裤",
          "imageUrl": "http://localhost:5000/uploads/clothes/yyy.jpg",
          "category": "bottom",
          "color": "黑"
        }
      },
      "warmthLevel": 2,
      "colorScheme": "白色系",
      "description": "夏日清爽搭配",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

---

#### 15. 添加收藏

**请求信息：**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/favorite`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "outfitData": {
      "top": {
        "id": "1234567890123456790",
        "name": "白色T恤",
        "imageUrl": "http://localhost:5000/uploads/clothes/xxx.jpg",
        "category": "top",
        "color": "白"
      },
      "bottom": {
        "id": "1234567890123456791",
        "name": "黑色牛仔裤",
        "imageUrl": "http://localhost:5000/uploads/clothes/yyy.jpg",
        "category": "bottom",
        "color": "黑"
      },
      "shoes": {
        "id": "1234567890123456792",
        "name": "白色运动鞋",
        "imageUrl": "http://localhost:5000/uploads/clothes/zzz.jpg",
        "category": "shoes",
        "color": "白"
      }
    },
    "warmthLevel": 2,
    "colorScheme": "白色系",
    "description": "夏日清爽搭配"
  }
  ```

**字段说明：**
- `outfitData`: 套装数据JSON对象（必填）
- `warmthLevel`: 保暖等级1-4（必填）
- `colorScheme`: 色系描述（可选）
- `description`: 描述（可选）

**预期响应：**
```json
{
  "success": true,
  "message": "添加收藏成功",
  "data": {
    "id": "1234567890123456800",
    "userId": "1234567890123456788",
    "outfitData": {...},
    "warmthLevel": 2,
    "colorScheme": "白色系",
    "description": "夏日清爽搭配",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 16. 删除收藏

**请求信息：**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/favorite/:id`
  - 例如：`{{base_url}}/api/favorite/1234567890123456800`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

**参数说明：**
- `id`: 收藏ID（URL路径参数）

**预期响应：**
```json
{
  "success": true,
  "message": "删除收藏成功"
}
```

---

## Postman 使用技巧

### 1. 设置 Authorization

对于需要认证的接口，有两种方式设置 Token：

**方法一：使用 Environment 变量（推荐）**
1. 在 Postman 中创建 Environment
2. 添加变量 `token`，值为登录后获取的 token
3. 在请求的 Authorization 标签页中：
   - Type 选择 `Bearer Token`
   - Token 填入 `{{token}}`

**方法二：手动设置 Header**
1. 在 Headers 标签页添加：
   - Key: `Authorization`
   - Value: `Bearer <你的token>`

### 2. 文件上传设置

对于需要上传文件的接口（添加衣物、编辑衣物、更新头像）：

1. 在 Body 标签页选择 `form-data`
2. 添加文件字段：
   - Key: 输入字段名（如 `clothes` 或 `avatar`）
   - 类型：点击右侧下拉菜单，选择 `File`
   - Value: 点击 `Select Files` 选择文件
3. 添加文本字段：
   - Key: 输入字段名（如 `name`、`warmthLevel`等）
   - 类型：保持为 `Text`
   - Value: 输入对应的值

### 3. 测试顺序建议

1. **先测试无需认证的接口**：注册、登录、天气接口
2. **登录后保存 token**
3. **测试需要认证的接口**：用户信息、衣物管理、推荐接口、收藏接口

### 4. 常见错误处理

**401 Unauthorized**
- 检查 token 是否正确设置
- 检查 token 是否过期（默认7天），如果过期需要重新登录

**400 Bad Request**
- 检查请求参数是否完整
- 检查文件上传格式是否正确
- 检查字段值是否符合要求（保暖等级1-4，种类和颜色的枚举值）

**404 Not Found**
- 检查 URL 路径是否正确
- 检查资源ID是否存在

**500 Internal Server Error**
- 检查服务器是否正常运行
- 查看服务器控制台日志

---

## 完整测试流程示例

1. **注册新用户** → 保存 token
2. **登录** → 验证 token 有效性
3. **获取当前天气**（北京）
4. **获取用户信息**（使用保存的 token）
5. **更新用户信息**（修改用户名和头像）
6. **添加衣物**（上传图片，填写完整信息）
7. **获取所有衣物**（查看刚才添加的衣物）
8. **按种类获取衣物**（例如：只查看上装）
9. **编辑衣物**（修改衣物信息）
10. **获取推荐套装**（基于城市天气或指定保暖等级和色系）
11. **添加收藏**（收藏推荐的套装）
12. **获取收藏列表**（查看收藏的套装）
13. **获取单个衣物详情**
14. **删除收藏**
15. **删除衣物**（测试删除功能）

---

## 注意事项

1. 确保服务器已启动并运行正常
2. 确保数据库已连接并已初始化
3. 上传文件大小限制为 5MB（可在 `.env` 中配置）
4. JWT Token 默认有效期为 7 天
5. 天气 API 需要有效的 OpenWeatherMap API Key
6. 用户ID和衣物ID使用雪花算法生成，为字符串类型的大整数
7. 推荐功能返回1套完整搭配，每次请求可能返回不同的搭配（随机选择）
8. 保暖等级说明：
   - 1级：很热（25℃以上）
   - 2级：温暖（15-25℃）
   - 3级：凉爽（5-15℃）
   - 4级：寒冷（5℃以下）
