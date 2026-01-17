const FavoriteOutfit = require('../models/FavoriteOutfit');

/**
 * 添加收藏套装
 */
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { outfitData, warmthLevel, colorScheme, description, temperature } =
      req.body;

    // 验证必填字段
    if (!outfitData || !warmthLevel) {
      return res.status(400).json({
        success: false,
        message: 'please provide outfit data and warmth level'
      });
    }

    // 验证保暖等级
    const warmth = parseInt(warmthLevel);
    if (isNaN(warmth) || warmth < 1 || warmth > 4) {
      return res.status(400).json({
        success: false,
        message: 'warmth level must be between 1 and 4'
      });
    }

    // 验证outfitData格式（应该是JSON对象）
    let outfitDataObj;
    try {
      outfitDataObj = typeof outfitData === 'string' ? JSON.parse(outfitData) : outfitData;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'outfit data format error'
      });
    }

    // 创建收藏
    const favorite = await FavoriteOutfit.create({
      userId,
      outfitData: outfitDataObj,
      warmthLevel: warmth,
      colorScheme: colorScheme || null,
      description: description || null,
      temperature:
        temperature !== undefined && temperature !== null
          ? Number(temperature)
          : null
    });

    res.status(201).json({
      success: true,
      message: 'add favorite success',
      data: favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'add favorite failed',
      error: error.message
    });
  }
};

/**
 * 获取用户收藏的套装列表
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { temperature } = req.query;

    const favorites = await FavoriteOutfit.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    const targetTemp = temperature !== undefined ? Number(temperature) : null;
    const normalized = favorites.map((favorite) => {
      const data = favorite.dataValues || favorite;
      return {
        ...data,
        temperature:
          data.temperature !== undefined && data.temperature !== null
            ? Number(data.temperature)
            : null
      };
    });

    const sorted =
      targetTemp !== null && !Number.isNaN(targetTemp)
        ? normalized
            .slice()
            .sort(
              (a, b) =>
                Math.abs((a.temperature ?? targetTemp) - targetTemp) -
                Math.abs((b.temperature ?? targetTemp) - targetTemp)
            )
        : normalized;

    res.json({
      success: true,
      message: 'get favorites success',
      data: sorted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'get favorites failed',
      error: error.message
    });
  }
};

/**
 * 删除收藏套装
 */
const deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const favorite = await FavoriteOutfit.findOne({
      where: { id, userId }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'favorite not found or no permission'
      });
    }

    await favorite.destroy();

    res.json({
      success: true,
      message: 'delete favorite success'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'delete favorite failed',
      error: error.message
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  deleteFavorite
};

