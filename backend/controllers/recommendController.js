const Clothes = require('../models/Clothes');
const { getCurrentWeather } = require('../utils/weatherAPI');
const { getSecondTagTemp, calculateOutfitTemp, calculateColorScore } = require('../utils/clothesUtils');

/**
 * 根据温度推荐1套衣物
 * 推荐原则：
 * 1. 温度：衣服厚度 = 26°C - 今日气温（衣服厚度是所有选中衣服的secondTag温度总和）
 * 2. 完整性：必须有Top+Bottom+Shoes，Accessory和Bag可选
 * 3. 颜色：黑/白作为万能基底；同色系深浅搭配；邻近色搭配
 */
const recommendClothes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { city, temperature, exclude } = req.query;

    let targetTemp = temperature ? parseFloat(temperature) : null;
    let weather = null;

    // 如果提供了城市，获取天气
    if (city) {
      const weatherResult = await getCurrentWeather(city);
      if (weatherResult.success) {
        weather = weatherResult.data;
        if (!targetTemp) {
          targetTemp = weather.temperature;
        }
      }
    }

    // 如果没有温度信息，返回错误
    if (targetTemp === null || isNaN(targetTemp)) {
      return res.status(400).json({
        success: false,
        message: 'please provide city name or temperature'
      });
    }

    // 计算目标衣服厚度
    const targetThickness = 26 - targetTemp;

    // 获取用户的所有衣物
    const allClothes = await Clothes.findAll({
      where: { userId }
    });

    // 按mainTag分组
    const clothesByMainTag = {
      Top: allClothes.filter(item => item.mainTag === 'Top'),
      Bottom: allClothes.filter(item => item.mainTag === 'Bottom'),
      Shoes: allClothes.filter(item => item.mainTag === 'Shoes'),
      Accessory: allClothes.filter(item => item.mainTag === 'Accessory'),
      Bag: allClothes.filter(item => item.mainTag === 'Bag')
    };

    // 检查是否有必需的衣物
    if (clothesByMainTag.Top.length === 0 || 
        clothesByMainTag.Bottom.length === 0 || 
        clothesByMainTag.Shoes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'clothes closet is missing necessary clothes (Top, Bottom, Shoes)'
      });
    }

    // 解析要排除的搭配ID（如果提供）
    let excludeOutfitIds = [];
    if (exclude) {
      try {
        excludeOutfitIds = JSON.parse(exclude);
        if (!Array.isArray(excludeOutfitIds)) {
          excludeOutfitIds = [];
        }
      } catch (e) {
        excludeOutfitIds = [];
      }
    }

    // 生成所有可能的搭配组合
    const outfits = generateOutfits(clothesByMainTag, targetThickness, excludeOutfitIds);

    if (outfits.length === 0) {
      return res.json({
        success: true,
        message: 'no outfit matches the temperature requirements',
        data: {
          weather,
          targetTemperature: targetTemp,
          targetThickness,
          outfit: null,
          availableCount: 0
        }
      });
    }

    // 审美原则：只在有多套合适的套装时才执行颜色评分排序
    let bestOutfit;
    let bestOutfitId;
    let colorScore = 0;
    if (outfits.length > 1) {
      // 有多套时，按颜色搭配分数排序，选择最佳的搭配
      outfits.sort((a, b) => b.colorScore - a.colorScore);
      bestOutfit = outfits[0].outfit;
      bestOutfitId = outfits[0].outfitId;
      colorScore = outfits[0].colorScore;
    } else if (outfits.length === 1) {
      // 只有一套时，直接使用，不考虑颜色评分
      bestOutfit = outfits[0].outfit;
      bestOutfitId = outfits[0].outfitId;
    }

    res.json({
      success: true,
      message: 'recommend success',
        data: {
          weather,
          targetTemperature: targetTemp,
          targetThickness,
          outfit: bestOutfit,
          outfitId: bestOutfitId || null,
          colorScore: colorScore,
          availableCount: outfits.length
        }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'recommend failed',
      error: error.message
    });
  }
};

/**
 * 生成所有可能的搭配组合
 * @param {Object} clothesByMainTag - 按类别分组的衣物
 * @param {number} targetThickness - 目标厚度
 * @param {Array<string>} excludeOutfitIds - 要排除的搭配ID列表（格式：["topId-bottomId-shoeId"]）
 */
function generateOutfits(clothesByMainTag, targetThickness, excludeOutfitIds = []) {
  const outfits = [];
  
  // 必须有Top、Bottom、Shoes
  const tops = clothesByMainTag.Top;
  const bottoms = clothesByMainTag.Bottom;
  const shoes = clothesByMainTag.Shoes;
  const accessories = clothesByMainTag.Accessory || [];
  const bags = clothesByMainTag.Bag || [];

  // 遍历所有可能的组合
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        // 先尝试不带配件的组合
        const outfit = {
          Top: top,
          Bottom: bottom,
          Shoes: shoe
        };
        
        const thickness = calculateOutfitTemp(outfit);
        const colorScore = calculateColorScore(outfit);
        
        // 生成搭配的唯一ID（Top-Bottom-Shoes的ID组合）
        const outfitId = `${top.id}-${bottom.id}-${shoe.id}`;
        
        // 检查是否在排除列表中（如果基础搭配被排除，则跳过所有变体）
        const isExcluded = excludeOutfitIds.includes(outfitId);
        
        // 检查温度是否匹配（允许±3°C的误差）
        if (!isExcluded && Math.abs(thickness - targetThickness) <= 3) {
          outfits.push({
            outfit,
            outfitId,
            thickness,
            colorScore
          });
        }

        // 如果基础搭配未被排除，才尝试添加配件
        if (!isExcluded) {
          // 尝试添加Accessory
          for (const accessory of accessories) {
            const outfitWithAccessory = { ...outfit, Accessory: accessory };
            const thicknessWithAcc = calculateOutfitTemp(outfitWithAccessory);
            const colorScoreWithAcc = calculateColorScore(outfitWithAccessory);
            
            if (Math.abs(thicknessWithAcc - targetThickness) <= 3) {
              outfits.push({
                outfit: outfitWithAccessory,
                outfitId,
                thickness: thicknessWithAcc,
                colorScore: colorScoreWithAcc
              });
            }
          }

          // 尝试添加Bag
          for (const bag of bags) {
            const outfitWithBag = { ...outfit, Bag: bag };
            const thicknessWithBag = calculateOutfitTemp(outfitWithBag);
            const colorScoreWithBag = calculateColorScore(outfitWithBag);
            
            if (Math.abs(thicknessWithBag - targetThickness) <= 3) {
              outfits.push({
                outfit: outfitWithBag,
                outfitId,
                thickness: thicknessWithBag,
                colorScore: colorScoreWithBag
              });
            }
          }

          // 尝试同时添加Accessory和Bag
          for (const accessory of accessories) {
            for (const bag of bags) {
              const outfitWithBoth = { ...outfit, Accessory: accessory, Bag: bag };
              const thicknessWithBoth = calculateOutfitTemp(outfitWithBoth);
              const colorScoreWithBoth = calculateColorScore(outfitWithBoth);
              
              if (Math.abs(thicknessWithBoth - targetThickness) <= 3) {
                outfits.push({
                  outfit: outfitWithBoth,
                  outfitId,
                  thickness: thicknessWithBoth,
                  colorScore: colorScoreWithBoth
                });
              }
            }
          }
        }
      }
    }
  }

  return outfits;
}

module.exports = {
  recommendClothes
};
