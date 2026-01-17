const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  addFavorite,
  getFavorites,
  deleteFavorite
} = require('../controllers/favoriteController');

// 所有路由都需要认证
router.use(authenticate);

// 获取收藏列表
router.get('/', getFavorites);
// 添加收藏
router.post('/', addFavorite);
// 删除收藏
router.delete('/:id', deleteFavorite);

module.exports = router;

