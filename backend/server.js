require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const clothesRoutes = require('./routes/clothes');
const recommendRoutes = require('./routes/recommend');
const userRoutes = require('./routes/user');
const favoriteRoutes = require('./routes/favorite');

const app = express();

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 静态文件服务（用于访问上传的图片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 连接数据库
connectDB();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/clothes', clothesRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/user', userRoutes);
app.use('/api/favorite', favoriteRoutes);

// 健康检查端点
app.get('/', (req, res) => {
  res.json({ 
    message: 'WeatherWear API 服务器运行中',
    version: '1.0.0'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '路由不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 WeatherWear API 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 上传文件目录: ${path.join(__dirname, 'uploads')}`);
});

