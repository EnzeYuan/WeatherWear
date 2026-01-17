const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateSnowflakeId } = require('../utils/snowflake');

const Clothes = sequelize.define('Clothes', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => generateSnowflakeId()
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  mainTag: {
    type: DataTypes.ENUM('Top', 'Bottom', 'Shoes', 'Accessory', 'Bag'),
    allowNull: false,
    comment: '主标签 (main tag): Top/Bottom/Shoes/Accessory/Bag'
  },
  secondTag: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '次标签 (second tag): Top(T恤/夹克/衬衫/棉服/卫衣/羽绒服/毛衣/大衣/保暖衣), Bottom(短裤/长裤/棉裤/秋裤), Accessory(围巾/手套/其他), Shoes和Bag为null'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述 (description)'
  },
  warmthLevel: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 0,
      max: 3
    },
    comment: '保暖等级 (warmth level): 0-3'
  },
  color: {
    type: DataTypes.ENUM('Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Black', 'White'),
    allowNull: false,
    comment: '颜色 (color): Red/Orange/Yellow/Green/Cyan/Blue/Purple/Black/White'
  },
  clothPicture: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '衣物图片URL (clothes picture URL)'
  }
}, {
  tableName: 'clothes',
  timestamps: true,
  hooks: {
    beforeCreate: async (clothes) => {
      // 生成雪花ID
      if (!clothes.id) {
        clothes.id = generateSnowflakeId();
      }
    }
  }
});

// 关联关系
const User = require('./User');

Clothes.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Clothes, { foreignKey: 'userId', as: 'clothes' });

module.exports = Clothes;

