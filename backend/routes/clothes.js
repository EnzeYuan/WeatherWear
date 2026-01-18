const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadClothes } = require('../middleware/upload');
const {
  getUserClothes,
  searchClothes,
  addClothes,
  updateClothes,
  deleteClothes,
  getClothesById,
  getClothesByMainTag
} = require('../controllers/clothesController');


// 所有路由都需要认证
router.use(authenticate);

// 搜索衣物（需要在:id之前定义，避免路由冲突）
router.get('/search', searchClothes);
// 按主标签查询（需要在:id之前定义，避免路由冲突）
router.get('/mainTag/:mainTag', getClothesByMainTag);
// 获取所有衣物或根据mainTag筛选
router.get('/', getUserClothes);
// 获取单个衣物详情
router.get('/:id', getClothesById);
// 添加衣物
router.post('/', uploadClothes, addClothes);
// 编辑衣物
router.put('/:id', uploadClothes, updateClothes);
// 删除衣物
router.delete('/:id', deleteClothes);


module.exports = router;

