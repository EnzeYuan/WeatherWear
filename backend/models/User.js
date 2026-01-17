const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateSnowflakeId } = require('../utils/snowflake');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    // 默认使用雪花算法生成ID，避免在验证阶段出现空值
    defaultValue: () => generateSnowflakeId()
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // 生成雪花ID
      if (!user.id) {
        user.id = generateSnowflakeId();
      }
      // 加密密码
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// 实例方法：验证密码
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;

