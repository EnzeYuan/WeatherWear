const { Op } = require('sequelize');
const Clothes = require('../models/Clothes');
const fs = require('fs');
const path = require('path');
const { getFileUrl, getFilenameFromUrl } = require('../utils/upload');
const { isValidTagCombination } = require('../utils/clothesUtils');

/**
 * 获取用户的所有衣物
 */
const getUserClothes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mainTag } = req.query; // 支持按mainTag筛选

    const where = { userId };
    if (mainTag) {
      where.mainTag = mainTag;
    }

    const clothes = await Clothes.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'get clothes success',
      data: clothes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'get clothes failed',
      error: error.message
    });
  }
};

/**
 * 模糊搜索衣物
 */
const searchClothes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'please input search keyword'
      });
    }

    const clothes = await Clothes.findAll({
      where: {
        userId,
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
          { mainTag: { [Op.like]: `%${keyword}%` } },
          { secondTag: { [Op.like]: `%${keyword}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'search clothes success',
      data: clothes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'search clothes failed',
      error: error.message
    });
  }
};

/**
 * 添加衣物
 */
const addClothes = async (req, res) => {
    console.log('=== Request Debug ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);
  try {
    const userId = req.user.id;
    const { name, mainTag, secondTag, description, warmthLevel, color } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'please upload clothes picture'
      });
    }

    // 验证必填字段
    if (!name || warmthLevel === undefined || !mainTag || !color) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'please provide complete clothes information (name, main tag, warmth level, color)'
      });
    }

    // 验证mainTag和secondTag的组合
    if (!isValidTagCombination(mainTag, secondTag || null)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'main tag and second tag combination is invalid'
      });
    }

    // 验证保暖等级
    const warmth = parseInt(warmthLevel);
    if (isNaN(warmth) || warmth < 0 || warmth > 3) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'warmth level must be between 0 and 3'
      });
    }

    // 验证mainTag
    const validMainTags = ['Top', 'Bottom', 'Shoes', 'Accessory', 'Bag'];
    if (!validMainTags.includes(mainTag)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'main tag must be one of: Top, Bottom, Shoes, Accessory, Bag'
      });
    }

    // 验证颜色
    const validColors = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Black', 'White'];
    if (!validColors.includes(color)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'color must be one of: Red, Orange, Yellow, Green, Cyan, Blue, Purple, Black, White'
      });
    }

    const clothPicture = getFileUrl(req.file.filename, 'clothes');

    const clothes = await Clothes.create({
      userId,
      name,
      mainTag,
      secondTag: secondTag || null,
      description: description || null,
      warmthLevel: warmth,
      color,
      clothPicture
    });

    res.status(201).json({
      success: true,
      message: 'add clothes success',
      data: clothes
    });
  } catch (error) {
    // 如果出错，删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'add clothes failed',
      error: error.message
    });
  }
};

/**
 * 编辑衣物
 */
const updateClothes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, mainTag, secondTag, description, warmthLevel, color } = req.body;

    const clothes = await Clothes.findOne({
      where: { id, userId }
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: 'clothes not found or no permission'
      });
    }

    // 更新字段
    if (name !== undefined) clothes.name = name;
    if (description !== undefined) clothes.description = description;
    
    if (mainTag !== undefined || secondTag !== undefined) {
      const newMainTag = mainTag !== undefined ? mainTag : clothes.mainTag;
      const newSecondTag = secondTag !== undefined ? (secondTag || null) : clothes.secondTag;
      
      if (!isValidTagCombination(newMainTag, newSecondTag)) {
        return res.status(400).json({
          success: false,
          message: 'main tag and second tag combination is invalid'
        });
      }
      
      if (mainTag !== undefined) clothes.mainTag = newMainTag;
      if (secondTag !== undefined) clothes.secondTag = newSecondTag;
    }
    
    if (warmthLevel !== undefined) {
      const warmth = parseInt(warmthLevel);
      if (isNaN(warmth) || warmth < 0 || warmth > 3) {
        return res.status(400).json({
          success: false,
          message: 'warmth level must be between 0 and 3'
        });
      }
      clothes.warmthLevel = warmth;
    }
    
    if (color !== undefined) {
      const validColors = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'White', 'Black'];
      if (!validColors.includes(color)) {
        return res.status(400).json({
          success: false,
          message: 'color must be one of: Red, Orange, Yellow, Green, Cyan, Blue, Purple, White, Black'
        });
      }
      clothes.color = color;
    }

    // 处理图片上传
    if (req.file) {
      // 删除旧图片
      if (clothes.clothPicture) {
        const oldFilename = getFilenameFromUrl(clothes.clothPicture);
        if (oldFilename) {
          const oldFilePath = path.join(__dirname, '../uploads/clothes', oldFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }
      clothes.clothPicture = getFileUrl(req.file.filename, 'clothes');
    }

    await clothes.save();

    res.json({
      success: true,
      message: 'update clothes success',
      data: clothes
    });
  } catch (error) {
    // 如果出错，删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'update clothes failed',
      error: error.message
    });
  }
};

/**
 * 删除衣物
 */
const deleteClothes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const clothes = await Clothes.findOne({
      where: { id, userId }
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: 'clothes not found or no permission'
      });
    }

    // 删除文件
    const filename = getFilenameFromUrl(clothes.clothPicture);
    if (filename) {
      const filePath = path.join(__dirname, '../uploads/clothes', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 删除数据库记录
    await clothes.destroy();

    res.json({
      success: true,
      message: 'delete clothes success'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'delete clothes failed',
      error: error.message
    });
  }
};

/**
 * 获取单个衣物详情
 */
const getClothesById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const clothes = await Clothes.findOne({
      where: { id, userId }
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: 'clothes not found or no permission'
      });
    }

    res.json({
      success: true,
      message: 'get clothes detail success',
      data: clothes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'get clothes detail failed',
      error: error.message
    });
  }
};

/**
 * 根据主标签获取用户的衣物
 */
const getClothesByMainTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mainTag } = req.params;

    const validMainTags = ['Top', 'Bottom', 'Shoes', 'Accessory', 'Bag'];
    if (!validMainTags.includes(mainTag)) {
      return res.status(400).json({
        success: false,
        message: 'main tag must be one of: Top, Bottom, Shoes, Accessory, Bag'
      });
    }

    const clothes = await Clothes.findAll({
      where: { userId, mainTag },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'get clothes success',
      data: clothes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'get clothes failed',
      error: error.message
    });
  }
};

module.exports = {
  getUserClothes,
  searchClothes,
  addClothes,
  updateClothes,
  deleteClothes,
  getClothesById,
  getClothesByMainTag
};
