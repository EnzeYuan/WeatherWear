const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateSnowflakeId } = require('../utils/snowflake');

const FavoriteOutfit = sequelize.define('FavoriteOutfit', {
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
  outfitData: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '套装数据 (outfit data): 包含top、bottom、shoes等衣物ID和信息的JSON'
  },
  warmthLevel: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 4
    },
    comment: '保暖等级 (warmth level): 1-4'
  },
  colorScheme: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '色系描述 (color scheme)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '套装描述 (description) '
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '收藏时的气温 (temperature at favorite)'
  }
}, {
  tableName: 'favorite_outfits',
  timestamps: true,
  hooks: {
    beforeCreate: async (outfit) => {
      // 生成雪花ID
      if (!outfit.id) {
        outfit.id = generateSnowflakeId();
      }
    }
  }
});

// 关联关系
const User = require('./User');

FavoriteOutfit.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(FavoriteOutfit, { foreignKey: 'userId', as: 'favoriteOutfits' });

module.exports = FavoriteOutfit;

