const path = require('path');

/**
 * 生成文件URL
 * @param {string} filename - 文件名
 * @param {string} type - 文件类型 (avatar/clothes)
 * @returns {string} 文件URL
 */
const getFileUrl = (filename, type = 'clothes') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${type}/${filename}`;
};

/**
 * 从URL中提取文件名
 * @param {string} url - 文件URL
 * @returns {string} 文件名
 */
const getFilenameFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1];
};

module.exports = {
  getFileUrl,
  getFilenameFromUrl
};

