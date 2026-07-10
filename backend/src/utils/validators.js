/**
 * Kiểm tra email hợp lệ
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra username hợp lệ
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Kiểm tra password mạnh
 */
const isStrongPassword = (password) => {
  // Ít nhất 6 ký tự, có số và chữ
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Kiểm tra URL hợp lệ
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Kiểm tra phone hợp lệ
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  isValidUrl,
  isValidPhone,
};