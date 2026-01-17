const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

// 所有路由都需要认证
router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', uploadAvatar, updateUserProfile);

module.exports = router;

