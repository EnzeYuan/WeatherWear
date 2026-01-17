# 数据库设计文档

本文档详细说明 WeatherWear 项目需要建立的数据库表结构及每个字段的含义。

## 数据库基本信息

- **数据库名称**: `weatherwear`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **ORM框架**: Sequelize
- **数据库类型**: MySQL
- **ID生成方式**: 雪花算法（Snowflake）

---

## 数据表列表

项目包含以下3个核心数据表：

1. **users** - 用户表
2. **clothes** - 衣物表
3. **favorite_outfits** - 收藏套装表

---

## 1. users 表（用户表）

存储用户的基本信息和账户信息。

### 表结构

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| `id` | BIGINT | PRIMARY KEY | 用户ID，主键，雪花算法生成 |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | 用户名，唯一，长度3-50字符 |
| `password` | VARCHAR(255) | NOT NULL | 密码（加密存储），使用bcrypt加密 |
| `avatar` | VARCHAR(255) | NULL | 头像图片URL路径，可为空 |
| `createdAt` | DATETIME | NOT NULL | 创建时间，Sequelize自动管理 |
| `updatedAt` | DATETIME | NOT NULL | 更新时间，Sequelize自动管理 |

### 字段详细说明

#### `id`
- **类型**: BIGINT
- **主键**: 是
- **生成方式**: 雪花算法（Snowflake）
- **说明**: 用户的唯一标识符，使用雪花算法生成，全局唯一

#### `username`
- **类型**: VARCHAR(50)
- **必填**: 是
- **唯一**: 是
- **验证**: 长度必须在3-50个字符之间
- **说明**: 用户的显示名称，用于登录和展示，必须唯一

#### `password`
- **类型**: VARCHAR(255)
- **必填**: 是
- **加密**: 使用 bcrypt 加密，加密强度为10轮
- **说明**: 用户密码，存储前会自动加密，永远不以明文形式存储

#### `avatar`
- **类型**: VARCHAR(255)
- **必填**: 否
- **默认值**: NULL
- **说明**: 用户头像图片的URL路径，格式如：`/uploads/avatars/xxx.jpg`
- **示例**: `http://localhost:5000/uploads/avatars/avatar_1234567890.jpg`

#### `createdAt`
- **类型**: DATETIME
- **自动管理**: 是（Sequelize自动添加）
- **说明**: 记录创建时间，用户注册时自动设置

#### `updatedAt`
- **类型**: DATETIME
- **自动管理**: 是（Sequelize自动更新）
- **说明**: 记录最后更新时间，每次修改用户信息时自动更新

### 关联关系

- **一对多**: 一个用户可以拥有多件衣物（`users.id` ← `clothes.userId`）
- **一对多**: 一个用户可以收藏多套搭配（`users.id` ← `favorite_outfits.userId`）

---

## 2. clothes 表（衣物表）

存储用户上传的衣物信息。

### 表结构

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| `id` | BIGINT | PRIMARY KEY | 衣物ID，主键，雪花算法生成 |
| `userId` | BIGINT | NOT NULL, FOREIGN KEY | 用户ID，外键关联users表 |
| `name` | VARCHAR(100) | NOT NULL | 衣物名称 |
| `warmthLevel` | TINYINT | NOT NULL | 保暖等级（1-4） |
| `imageUrl` | VARCHAR(255) | NOT NULL | 衣物图片URL路径 |
| `category` | ENUM | NOT NULL | 种类（top/bottom/shoes/bag/accessory） |
| `color` | ENUM | NOT NULL | 颜色（白/黑/暖黄棕色/蓝色/红色/其他） |
| `createdAt` | DATETIME | NOT NULL | 创建时间，Sequelize自动管理 |
| `updatedAt` | DATETIME | NOT NULL | 更新时间，Sequelize自动管理 |

### 字段详细说明

#### `id`
- **类型**: BIGINT
- **主键**: 是
- **生成方式**: 雪花算法（Snowflake）
- **说明**: 衣物的唯一标识符，使用雪花算法生成

#### `userId`
- **类型**: BIGINT
- **必填**: 是
- **外键**: 关联 `users.id`
- **级联删除**: CASCADE（删除用户时，自动删除该用户的所有衣物）
- **说明**: 衣物所属用户的ID，用于关联用户和衣物

#### `name`
- **类型**: VARCHAR(100)
- **必填**: 是
- **说明**: 衣物的名称，例如："白色T恤"、"黑色牛仔裤"、"红色运动鞋"等

#### `warmthLevel`
- **类型**: TINYINT
- **必填**: 是
- **取值范围**: 1-4
- **说明**: 衣物的保暖等级
  - 1级：很热（25℃以上）
  - 2级：温暖（15-25℃）
  - 3级：凉爽（5-15℃）
  - 4级：寒冷（5℃以下）

#### `imageUrl`
- **类型**: VARCHAR(255)
- **必填**: 是
- **说明**: 衣物图片的URL路径，格式如：`/uploads/clothes/xxx.jpg`
- **示例**: `http://localhost:5000/uploads/clothes/clothes_1234567890.jpg`
- **存储位置**: 服务器 `uploads/clothes/` 目录下

#### `category`
- **类型**: ENUM('top', 'bottom', 'shoes', 'bag', 'accessory')
- **必填**: 是
- **说明**: 衣物的种类
  - `top`: 上装（T恤、衬衫、外套等）
  - `bottom`: 下装（裤子、裙子等）
  - `shoes`: 鞋子
  - `bag`: 包
  - `accessory`: 配饰

#### `color`
- **类型**: ENUM('白', '黑', '暖黄棕色', '蓝色', '红色', '其他')
- **必填**: 是
- **说明**: 衣物的颜色
  - `白`: 白色
  - `黑`: 黑色
  - `暖黄棕色`: 暖黄棕色系
  - `蓝色`: 蓝色系
  - `红色`: 红色系
  - `其他`: 其他颜色

#### `createdAt`
- **类型**: DATETIME
- **自动管理**: 是
- **说明**: 衣物创建时间，用户上传时自动设置

#### `updatedAt`
- **类型**: DATETIME
- **自动管理**: 是
- **说明**: 衣物最后更新时间，修改衣物信息时自动更新

### 关联关系

- **多对一**: 多件衣物属于一个用户（`clothes.userId` → `users.id`）

### 业务逻辑

- 每个用户只能查看和管理自己的衣物
- 删除用户时，会自动删除该用户的所有衣物记录和对应的图片文件
- 推荐算法根据保暖等级和色系来筛选合适的衣物，组成一套完整的搭配

---

## 3. favorite_outfits 表（收藏套装表）

存储用户收藏的推荐套装信息。

### 表结构

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| `id` | BIGINT | PRIMARY KEY | 收藏ID，主键，雪花算法生成 |
| `userId` | BIGINT | NOT NULL, FOREIGN KEY | 用户ID，外键关联users表 |
| `outfitData` | JSON | NOT NULL | 套装数据（包含top、bottom、shoes等衣物信息的JSON） |
| `warmthLevel` | TINYINT | NOT NULL | 保暖等级（1-4） |
| `colorScheme` | VARCHAR(50) | NULL | 色系描述，可为空 |
| `description` | TEXT | NULL | 套装描述，可为空 |
| `createdAt` | DATETIME | NOT NULL | 创建时间，Sequelize自动管理 |
| `updatedAt` | DATETIME | NOT NULL | 更新时间，Sequelize自动管理 |

### 字段详细说明

#### `id`
- **类型**: BIGINT
- **主键**: 是
- **生成方式**: 雪花算法（Snowflake）
- **说明**: 收藏的唯一标识符，使用雪花算法生成

#### `userId`
- **类型**: BIGINT
- **必填**: 是
- **外键**: 关联 `users.id`
- **级联删除**: CASCADE（删除用户时，自动删除该用户的所有收藏）
- **说明**: 收藏所属用户的ID

#### `outfitData`
- **类型**: JSON
- **必填**: 是
- **说明**: 套装数据的JSON对象，包含推荐搭配的衣物信息
- **格式示例**:
  ```json
  {
    "top": {
      "id": "1234567890",
      "name": "白色T恤",
      "imageUrl": "/uploads/clothes/xxx.jpg",
      "category": "top",
      "color": "白"
    },
    "bottom": {
      "id": "1234567891",
      "name": "黑色牛仔裤",
      "imageUrl": "/uploads/clothes/yyy.jpg",
      "category": "bottom",
      "color": "黑"
    },
    "shoes": {
      "id": "1234567892",
      "name": "白色运动鞋",
      "imageUrl": "/uploads/clothes/zzz.jpg",
      "category": "shoes",
      "color": "白"
    }
  }
  ```

#### `warmthLevel`
- **类型**: TINYINT
- **必填**: 是
- **取值范围**: 1-4
- **说明**: 套装的保暖等级，与clothes表的warmthLevel含义相同

#### `colorScheme`
- **类型**: VARCHAR(50)
- **必填**: 否
- **默认值**: NULL
- **说明**: 套装的色系描述，例如："白色系"、"黑色系"等

#### `description`
- **类型**: TEXT
- **必填**: 否
- **默认值**: NULL
- **说明**: 用户对套装的描述信息，例如："夏日清爽搭配"、"冬日温暖搭配"等

#### `createdAt`
- **类型**: DATETIME
- **自动管理**: 是
- **说明**: 收藏创建时间，用户收藏时自动设置

#### `updatedAt`
- **类型**: DATETIME
- **自动管理**: 是
- **说明**: 收藏最后更新时间

### 关联关系

- **多对一**: 多套收藏属于一个用户（`favorite_outfits.userId` → `users.id`）

### 业务逻辑

- 每个用户只能查看和管理自己的收藏
- 删除用户时，会自动删除该用户的所有收藏记录
- 收藏的套装数据以JSON格式存储，包含完整的衣物信息

---

## 数据库初始化

### 1. 创建数据库

```sql
CREATE DATABASE weatherwear CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 表自动创建

使用 Sequelize 时，表结构会根据模型定义自动创建。启动应用时，Sequelize 会自动同步表结构。

---

## 数据库关系图

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ username    │
│ password    │
│ avatar      │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1:N
       │
       ├────────────────────────┐
       │                        │
       ▼                        ▼
┌─────────────┐       ┌──────────────────┐
│   clothes   │       │ favorite_outfits │
├─────────────┤       ├──────────────────┤
│ id (PK)     │       │ id (PK)          │
│ userId (FK) │       │ userId (FK)      │
│ name        │       │ outfitData (JSON)│
│ warmthLevel │       │ warmthLevel      │
│ imageUrl    │       │ colorScheme      │
│ category    │       │ description      │
│ color       │       │ createdAt        │
│ createdAt   │       │ updatedAt        │
│ updatedAt   │       └──────────────────┘
└─────────────┘
```

**关系说明：**
- `users` 和 `clothes`：一对多关系（一个用户有多件衣物）
- `users` 和 `favorite_outfits`：一对多关系（一个用户可以收藏多套搭配）

---

## 索引说明

### 自动创建的索引

1. **主键索引**: 所有表的 `id` 字段自动创建主键索引
2. **唯一索引**: 
   - `users.username`
3. **外键索引**: 
   - `clothes.userId`（关联 users.id）
   - `favorite_outfits.userId`（关联 users.id）

### 建议的额外索引（可选）

如果需要优化查询性能，可以考虑添加以下索引：

```sql
-- 用户查询自己的衣物（按创建时间排序）
CREATE INDEX idx_clothes_user_created ON clothes(userId, createdAt DESC);

-- 按种类查询衣物
CREATE INDEX idx_clothes_user_category ON clothes(userId, category);

-- 按保暖等级查询衣物（用于推荐）
CREATE INDEX idx_clothes_warmth ON clothes(userId, warmthLevel);

-- 收藏列表查询
CREATE INDEX idx_favorite_user_created ON favorite_outfits(userId, createdAt DESC);
```

---

## 数据约束和验证

### 用户表约束

- 用户名长度：3-50字符
- 用户名必须唯一
- 密码：存储前必须加密（bcrypt）

### 衣物表约束

- 必须关联有效的用户ID
- 保暖等级必须在1-4之间
- 种类必须是：top、bottom、shoes、bag、accessory之一
- 颜色必须是：白、黑、暖黄棕色、蓝色、红色、其他之一
- 图片URL不能为空
- 名称不能为空

### 收藏表约束

- 必须关联有效的用户ID
- 保暖等级必须在1-4之间
- outfitData必须是有效的JSON格式
- outfitData不能为空

---

## 注意事项

1. **字符编码**: 使用 `utf8mb4` 字符集，支持emoji和所有Unicode字符
2. **时间字段**: 使用 `DATETIME` 类型，存储时区为服务器时区
3. **密码安全**: 密码使用 bcrypt 加密，加密强度为10轮
4. **文件存储**: 图片文件存储在服务器本地，URL存储在数据库中
5. **级联删除**: 删除用户时会自动删除该用户的所有衣物和收藏记录
6. **ID生成**: 使用雪花算法生成唯一ID，无需自增
7. **JSON字段**: favorite_outfits表的outfitData字段使用JSON类型存储套装数据

---

## SQL 示例查询

### 查询用户的衣物

```sql
SELECT 
    id,
    name,
    warmthLevel,
    category,
    color,
    imageUrl,
    createdAt
FROM clothes
WHERE userId = '1234567890123456789'
ORDER BY createdAt DESC;
```

### 根据种类查询用户的衣物

```sql
SELECT * FROM clothes
WHERE userId = '1234567890123456789'
  AND category = 'top'
ORDER BY createdAt DESC;
```

### 根据保暖等级查询用户的衣物

```sql
SELECT * FROM clothes
WHERE userId = '1234567890123456789'
  AND warmthLevel = 2
ORDER BY createdAt DESC;
```

### 查询用户的收藏套装

```sql
SELECT 
    id,
    outfitData,
    warmthLevel,
    colorScheme,
    description,
    createdAt
FROM favorite_outfits
WHERE userId = '1234567890123456789'
ORDER BY createdAt DESC;
```

### 根据保暖等级和颜色查询用户的衣物（用于推荐）

```sql
SELECT * FROM clothes
WHERE userId = '1234567890123456789'
  AND warmthLevel = 2
  AND color IN ('白', '黑')
ORDER BY category, createdAt DESC;
```
