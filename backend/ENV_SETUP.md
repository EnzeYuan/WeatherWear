# 环境变量配置说明

请创建 `.env` 文件并配置以下环境变量：

```env
# 服务器配置
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# 数据库配置
DB_HOST=jdbc:mysql:aws://localhost:3306/?allowPublicKeyRetrieval=true&useSSL=false
DB_USER=root
DB_PASSWORD=123456
DB_NAME=weatherwear

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# 天气API配置（使用OpenWeatherMap API）
# 注册地址：https://openweathermap.org/api
WEATHER_API_KEY=3bad299b0643e6f4b54c8fed84e13f7d
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# 文件上传配置（单位：字节，5242880 = 5MB）
UPLOAD_MAX_SIZE=5242880
```

## 配置说明

1. **数据库配置**：根据你的MySQL配置修改 `DB_HOST`、`DB_USER`、`DB_PASSWORD` 和 `DB_NAME`
2. **JWT密钥**：生产环境请使用强随机字符串作为 `JWT_SECRET`
3. **天气API密钥**：需要到 https://openweathermap.org/api 注册账号获取免费API密钥

## 快速开始

1. 复制此文件内容创建 `.env` 文件
2. 修改相应的配置值
3. 确保MySQL服务已启动
4. 运行 `npm install` 安装依赖
5. 运行 `npm run dev` 启动开发服务器

