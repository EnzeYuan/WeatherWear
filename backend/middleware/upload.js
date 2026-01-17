const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
const clothesDir = path.join(uploadsDir, 'clothes');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, clothesDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


// 在文件顶部添加
// const debugMulter = (req, res, next) => {
//   console.log('=== Multer Debug Info ===');
//   console.log('Content-Type:', req.headers['content-type']);
//   console.log('请求中的字段列表:');
  
//   // 如果是 multipart/form-data, busboy 会解析字段
//   req.on('field', (fieldname, val) => {
//     console.log(`文本字段: ${fieldname} = ${val}`);
//   });
  
//   req.on('file', (fieldname, file) => {
//     console.log(`文件字段: ${fieldname}, 文件名: ${file.originalname}`);
//   });
  
//   req.on('finish', () => {
//     console.log('=== 请求解析完成 ===');
//   });
  
//   next();
// };

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else if (file.fieldname === 'clothPicture') {
      cb(null, clothesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('只支持图片格式: jpeg, jpg, png, gif, webp'));
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});



// 上传中间件
const uploadAvatar = upload.single('avatar');
const uploadClothes = upload.single('clothPicture');

module.exports = {
  uploadAvatar,
  uploadClothes,
  upload
};

