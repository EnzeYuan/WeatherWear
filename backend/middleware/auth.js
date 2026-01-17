const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');

// JWT验证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供认证令牌，请先登录' 
      });
    }

    // 验证token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // 查找用户
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: '无效的认证令牌' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: '认证令牌已过期，请重新登录' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
};

module.exports = { authenticate };

