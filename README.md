# 🌐 DRK Social Network

> Mạng xã hội trực tuyến - Kết nối cộng đồng, chia sẻ mọi khoảnh khắc

![DRK Social Network](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [Docker Deployment](#-docker-deployment)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

---

## 🎯 Giới thiệu

**DRK Social Network** là một nền tảng mạng xã hội được xây dựng với công nghệ hiện đại, cho phép người dùng kết nối, chia sẻ và tương tác với nhau. Dự án được phát triển nhằm mục đích học tập và thực hành các kỹ năng phát triển web full-stack.

### ✨ Điểm nổi bật

- ⚡ **Giao diện mượt mà** với React và Tailwind CSS
- 🔒 **Bảo mật cao** với JWT và bcrypt
- 💬 **Tin nhắn thời gian thực** với Socket.io
- 📱 **Responsive** trên mọi thiết bị
- 🌓 **Dark/Light mode** chuyển đổi linh hoạt
- 🚀 **Hiệu suất cao** với kiến trúc SPA

---

## 🚀 Tính năng chính

### 👤 Xác thực & Người dùng
- Đăng ký / Đăng nhập
- Quản lý hồ sơ cá nhân
- Cập nhật ảnh đại diện và ảnh bìa
- Xác thực JWT

### 📝 Bài viết & Tương tác
- Tạo bài viết với văn bản, hình ảnh, video, âm thanh
- Like với 6 loại cảm xúc (❤️ Like, 😍 Love, 😂 Haha, 😮 Wow, 😢 Sad, 😡 Angry)
- Bình luận và chia sẻ bài viết
- Chỉnh sửa và xóa bài viết

### 📸 Story
- Đăng story với ảnh, video hoặc văn bản
- Thêm nhạc nền
- Tự động hết hạn sau 24 giờ

### 💬 Nhắn tin
- Nhắn tin thời gian thực với Socket.io
- Hiển thị trạng thái online/offline
- Đánh dấu tin nhắn đã đọc

### 🔔 Thông báo
- Thông báo realtime khi có like, comment, kết bạn
- Đánh dấu đã đọc / xóa thông báo

### 👥 Kết bạn
- Gửi / chấp nhận / từ chối lời mời kết bạn
- Hủy kết bạn
- Gợi ý bạn bè dựa trên bạn chung

### 👥 Nhóm
- Tạo nhóm công khai / riêng tư / bí mật
- Quản lý thành viên và phân quyền
- Duyệt bài viết trong nhóm

### 🛠️ Quản trị
- Quản lý người dùng (khóa/mở khóa/xóa)
- Quản lý bài viết (duyệt/từ chối/xóa)
- Xử lý báo cáo
- Cài đặt hệ thống

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Công nghệ | Mô tả |
|-----------|-------|
| [React 18](https://react.dev/) | Thư viện xây dựng giao diện người dùng |
| [Vite](https://vitejs.dev/) | Build tool nhanh chóng |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS tiện ích |
| [React Router](https://reactrouter.com/) | Điều hướng trang |
| [Axios](https://axios-http.com/) | HTTP Client |
| [Socket.io Client](https://socket.io/) | Giao tiếp thời gian thực |

### Backend
| Công nghệ | Mô tả |
|-----------|-------|
| [Node.js](https://nodejs.org/) | Môi trường chạy JavaScript |
| [Express.js](https://expressjs.com/) | Framework web |
| [MongoDB](https://www.mongodb.com/) | Cơ sở dữ liệu NoSQL |
| [Mongoose](https://mongoosejs.com/) | ODM cho MongoDB |
| [Socket.io](https://socket.io/) | Real-time communication |
| [JWT](https://jwt.io/) | Xác thực người dùng |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Mã hóa mật khẩu |
| [Cloudinary](https://cloudinary.com/) | Lưu trữ media |

### DevOps
| Công nghệ | Mô tả |
|-----------|-------|
| [Docker](https://www.docker.com/) | Containerization |
| [Docker Compose](https://docs.docker.com/compose/) | Orchestration |
| [Nginx](https://nginx.org/) | Web server & Reverse proxy |
| [Git](https://git-scm.com/) | Version control |

---

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc bun
- Docker (tùy chọn)

### Clone dự án

```bash
git clone https://github.com/yourusername/social-network.git
cd social-network