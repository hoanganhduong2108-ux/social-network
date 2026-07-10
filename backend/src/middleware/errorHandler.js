/**
 * Middleware xử lý lỗi tập trung
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} đã tồn tại`;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID không hợp lệ';
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ';
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token đã hết hạn';
  }

  // Multer error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Kích thước file quá lớn';
  }

  // Cloudinary error
  if (err.http_code) {
    statusCode = err.http_code;
    message = 'Lỗi upload file';
  }

  // Log error
  console.error('Error:', {
    status: statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

module.exports = { errorHandler };