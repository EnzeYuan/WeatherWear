const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'please provide username and password'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      password
    });

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};

