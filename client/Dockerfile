# ============================================
# FILE: Dockerfile
# MÔ TẢ: Dockerfile cho ứng dụng React
# ============================================

# Stage 1: Build
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./
COPY bun.lock ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy file build từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose cổng 80
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]