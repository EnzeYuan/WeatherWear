const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { getFileUrl, getFilenameFromUrl } = require('../utils/upload');

/**
 * 获取用户信息
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: '获取用户信息成功',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};

/**
 * 更新用户信息
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新用户名（如果提供且不同）
    if (username && username !== user.username) {
      // 检查用户名是否已被使用
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已被使用'
        });
      }
      user.username = username;
    }

    // 处理头像上传
    if (req.file) {
      // 删除旧头像
      if (user.avatar) {
        const oldFilename = getFilenameFromUrl(user.avatar);
        if (oldFilename) {
          const oldFilePath = path.join(__dirname, '../uploads/avatars', oldFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }
      user.avatar = getFileUrl(req.file.filename, 'avatars');
    }

    await user.save();

    // 返回更新后的用户信息（不包含密码）
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: '更新用户信息成功',
      data: updatedUser
    });
  } catch (error) {
    // 如果出错，删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};

