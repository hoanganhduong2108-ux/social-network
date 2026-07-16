# ============================================
# FILE: backend/Dockerfile
# MÔ TẢ: Dockerfile cho Backend
# ============================================

FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy mã nguồn
COPY . .

# Tạo thư mục uploads
RUN mkdir -p uploads images videos audios avatars posts stories covers groups

# Expose cổng
EXPOSE 5000

# Chạy ứng dụng
CMD ["npm", "run", "dev"]