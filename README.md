# WeatherWear

WeatherWear 是一款集天气、穿搭推荐与虚拟衣橱于一体的移动应用。用户可以注册登录、管理衣物（增删改查+图片上传）、查看实时天气与穿搭推荐、收藏喜欢的套装，并根据温度筛选收藏内容。

## 项目结构

```
WeatherWear/
├─ backend/              # Node.js + Express 后端
└─ frontend/WeatherWear/ # React Native + Expo 前端
```

## 功能概览

- 用户认证：登录/注册、JWT 鉴权、雪花算法生成ID
- 个人资料：头像展示与上传
- 虚拟衣橱：衣物管理、分类与搜索、图片上传
- 天气信息：实时天气、详情页、小时/日预报
- 穿搭推荐：按温度推荐套装，支持“换一换”
- 收藏夹：收藏套装、温度筛选

## 技术栈

**Frontend**
- React Native + Expo
- TypeScript
- expo-router
- AsyncStorage
- expo-image-picker

**Backend**
- Node.js + Express
- Sequelize + MySQL
- JWT 认证
- Multer 文件上传
- Redis 缓存（天气接口）

## 安装与运行

### 1) 后端

```bash
cd backend
npm install
```

配置环境变量（如数据库、JWT、Redis），可参考 `backend/ENV_SETUP.md`。

启动后端：

```bash
npm run dev
# 或
npm start
```

默认地址：`http://localhost:5000`

### 2) 前端

```bash
cd frontend/WeatherWear
npm install
```

配置 API 地址（任选其一）：

- 修改 `frontend/WeatherWear/constants/config.ts` 中的 `API_BASE_URL`
- 或设置 `EXPO_PUBLIC_API_BASE_URL` 环境变量

启动前端：

```bash
npm run start
```

然后使用 Expo Go 或模拟器运行。

## App 截图

> 请替换为真实截图路径（建议放到 `frontend/WeatherWear/assets/screenshots/`）

![Login](frontend/WeatherWear/assets/images/login/logo.png)
![Weather Outfit](frontend/WeatherWear/assets/images/WeatherOutfit/sunny.png)
![Virtual Wardrobe](frontend/WeatherWear/assets/images/Closet/All.png)
![Favorites](frontend/WeatherWear/assets/images/favorites/block.png)

