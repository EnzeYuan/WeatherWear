/**
 * 衣物工具函数
 * 包含secondTag温度映射、颜色搭配规则等
 */

// secondTag温度映射（单位：°C）
const SECOND_TAG_TEMP_MAP = {
  // Top
  'T-Shirt': 1,
  'Jacket': 4,
  'Shirt': 2,
  'Coat': 7,
  'Hoodie': 3,
  'Down Jacket': 9,
  'Sweater': 6,
  'Coat': 8,
  'Warm Jacket': 5,
  // Bottom
  'Shorts': 1,
  'Long Pants': 3,
  'Thick Pants': 5,
  'Thin Pants': 2,
  // Accessory
  'Scarf': 1,
  'Gloves': 1,
  'Other': 0,
  // Shoes和Bag
  null: 0
};

// mainTag的secondTag可选值
const MAIN_TAG_SECOND_TAGS = {
  'Top': ['T-Shirt', 'Jacket', 'Shirt', 'Coat', 'Hoodie', 'Down Jacket', 'Sweater', 'Coat', 'Warm Jacket'],
  'Bottom': ['Shorts', 'Long Pants', 'Thick Pants', 'Thin Pants'],
  'Accessory': ['Scarf', 'Gloves', 'Other'],
  'Shoes': [null],
  'Bag': [null]
};

/**
 * 获取secondTag对应的温度值
 */
function getSecondTagTemp(secondTag) {
  return SECOND_TAG_TEMP_MAP[secondTag] !== undefined ? SECOND_TAG_TEMP_MAP[secondTag] : 0;
}

/**
 * 验证mainTag和secondTag的组合是否有效
 */
function isValidTagCombination(mainTag, secondTag) {
  const validSecondTags = MAIN_TAG_SECOND_TAGS[mainTag];
  if (!validSecondTags) return false;
  return validSecondTags.includes(secondTag);
}

/**
 * 颜色搭配规则
 */
const COLOR_RULES = {
  // 万能基底颜色
  baseColors: ['Black', 'White'],
  
  // 暖色系
  warmColors: ['Red', 'Orange', 'Yellow'],
  
  // 冷色系
  coolColors: ['Green', 'Cyan', 'Blue', 'Purple'],
  
  // 邻近色组合（色环上相邻30-60°）
  adjacentPairs: [
    ['Red', 'Orange'],
    ['Yellow', 'Green'],
    ['Cyan', 'Blue'],
    ['Blue', 'Purple']
  ],
  
  // 同色系（相同颜色不同深浅算同色系，这里简化处理）
  sameColorFamily: (color1, color2) => {
    return color1 === color2;
  }
};

/**
 * 检查两个颜色是否搭配
 * 返回搭配分数（0-3）：0不搭配，1-3搭配程度
 */
function checkColorMatch(color1, color2) {
  // 相同颜色
  if (color1 === color2) {
    return 3; // 同色系深浅搭配
  }
  
  // 黑白作为基底
  if (COLOR_RULES.baseColors.includes(color1) || COLOR_RULES.baseColors.includes(color2)) {
    return 2; // 黑白与任何颜色都搭配
  }
  
  // 邻近色搭配
  for (const pair of COLOR_RULES.adjacentPairs) {
    if ((pair.includes(color1) && pair.includes(color2))) {
      return 2; // 邻近色搭配
    }
  }
  
  // 暖色+黑色，冷色+白色（黑白基底的特殊搭配）
  if (color1 === 'Black' && COLOR_RULES.warmColors.includes(color2)) return 2;
  if (color1 === 'White' && COLOR_RULES.coolColors.includes(color2)) return 2;
  if (color2 === 'Black' && COLOR_RULES.warmColors.includes(color1)) return 2;
  if (color2 === 'White' && COLOR_RULES.coolColors.includes(color1)) return 2;
  
  return 0; // 不搭配
}

/**
 * 计算一套衣服的总温度
 */
function calculateOutfitTemp(outfit) {
  let totalTemp = 0;
  
  if (outfit.Top && outfit.Top.secondTag) {
    totalTemp += getSecondTagTemp(outfit.Top.secondTag);
  }
  if (outfit.Bottom && outfit.Bottom.secondTag) {
    totalTemp += getSecondTagTemp(outfit.Bottom.secondTag);
  }
  if (outfit.Accessory && outfit.Accessory.secondTag) {
    totalTemp += getSecondTagTemp(outfit.Accessory.secondTag);
  }
  // Shoes和Bag的温度为0
  
  return totalTemp;
}

/**
 * 计算一套衣服的颜色搭配分数
 */
function calculateColorScore(outfit) {
  const colors = [];
  if (outfit.Top && outfit.Top.color) colors.push(outfit.Top.color);
  if (outfit.Bottom && outfit.Bottom.color) colors.push(outfit.Bottom.color);
  if (outfit.Shoes && outfit.Shoes.color) colors.push(outfit.Shoes.color);
  if (outfit.Accessory && outfit.Accessory.color) colors.push(outfit.Accessory.color);
  if (outfit.Bag && outfit.Bag.color) colors.push(outfit.Bag.color);
  
  if (colors.length === 0) return 0;
  if (colors.length === 1) return 3; // 单件物品
  
  let score = 0;
  let pairs = 0;
  
  // 计算所有颜色对的搭配分数
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const matchScore = checkColorMatch(colors[i], colors[j]);
      score += matchScore;
      pairs++;
    }
  }
  
  // 返回平均分
  return pairs > 0 ? score / pairs : 0;
}

module.exports = {
  getSecondTagTemp,
  isValidTagCombination,
  MAIN_TAG_SECOND_TAGS,
  SECOND_TAG_TEMP_MAP,
  checkColorMatch,
  calculateOutfitTemp,
  calculateColorScore
};

