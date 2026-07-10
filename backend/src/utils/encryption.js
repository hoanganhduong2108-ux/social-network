const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * So sánh password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Tạo token ngẫu nhiên
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Mã hóa dữ liệu
 */
const encryptData = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'secret-key');
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Giải mã dữ liệu
 */
const decryptData = (encryptedData) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'secret-key');
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomToken,
  encryptData,
  decryptData,
};