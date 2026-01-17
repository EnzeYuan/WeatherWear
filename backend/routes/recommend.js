const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { recommendClothes } = require('../controllers/recommendController');

// 需要认证
router.use(authenticate);

router.get('/', recommendClothes);

module.exports = router;

