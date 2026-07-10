const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    title: {
      type: String,
      required: [true, 'Tiêu đề sự kiện là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Mô tả không được vượt quá 5000 ký tự'],
    },
    image: {
      type: String,
      default: '',
    },
    
    // Thời gian
    startTime: {
      type: Date,
      required: [true, 'Thời gian bắt đầu là bắt buộc'],
    },
    endTime: {
      type: Date,
      required: [true, 'Thời gian kết thúc là bắt buộc'],
    },
    timezone: {
      type: String,
      default: 'UTC+7',
    },
    
    // Địa điểm
    location: {
      name: {
        type: String,
        required: [true, 'Địa điểm là bắt buộc'],
      },
      address: {
        type: String,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
      online: {
        type: Boolean,
        default: false,
      },
      link: {
        type: String,
      },
    },
    
    // Loại sự kiện
    type: {
      type: String,
      enum: ['in-person', 'online', 'hybrid'],
      default: 'in-person',
    },
    category: {
      type: String,
      enum: [
        'conference', 'workshop', 'meetup', 'party', 'concert', 'sports',
        'charity', 'business', 'education', 'entertainment', 'networking',
        'festival', 'exhibition', 'seminar', 'webinar', 'fundraiser',
        'competition', 'camp', 'retreat', 'wedding', 'birthday', 'anniversary'
      ],
      default: 'meetup',
    },
    tags: [String],
    
    // Người tổ chức
    organizer: {
      type: {
        type: String,
        enum: ['user', 'page', 'group'],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'organizer.type',
      },
    },
    coOrganizers: [
      {
        type: {
          type: String,
          enum: ['user', 'page', 'group'],
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'coOrganizers.type',
        },
      },
    ],
    
    // Quyền riêng tư
    privacy: {
      type: String,
      enum: ['public', 'friends', 'invite-only', 'private'],
      default: 'public',
    },
    
    // Người tham gia
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['going', 'interested', 'not-going'],
          default: 'interested',
        },
        rsvpAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ['attendee', 'speaker', 'staff', 'volunteer'],
          default: 'attendee',
        },
      },
    ],
    invitees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        responded: {
          type: Boolean,
          default: false,
        },
      },
    ],
    
    // Sức chứa
    capacity: {
      type: Number,
    },
    isFull: {
      type: Boolean,
      default: false,
    },
    waitingList: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Giá vé
    tickets: {
      free: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'VND',
      },
      purchaseUrl: {
        type: String,
      },
    },
    
    // Bài viết
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    
    // Thảo luận
    discussions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    
    // Thống kê
    stats: {
      attendees: { type: Number, default: 0 },
      interested: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    
    // Trạng thái
    status: {
      type: String,
      enum: ['draft', 'published', 'canceled', 'completed', 'postponed'],
      default: 'draft',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
      type: String,
    },
    
    // Lịch sử
    activityLog: [
      {
        action: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        details: { type: mongoose.Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Tạo index
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ startTime: 1, endTime: 1 });
eventSchema.index({ 'organizer.id': 1, 'organizer.type': 1 });

// Phương thức kiểm tra sự kiện sắp diễn ra
eventSchema.methods.isUpcoming = function () {
  return this.startTime > new Date();
};

// Phương thức kiểm tra sự kiện đang diễn ra
eventSchema.methods.isOngoing = function () {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
};

// Phương thức thêm người tham gia
eventSchema.methods.addAttendee = async function (userId, status = 'going') {
  if (!this.attendees.some(a => a.user.toString() === userId.toString())) {
    this.attendees.push({ user: userId, status });
    this.stats.attendees = this.attendees.filter(a => a.status === 'going').length;
    this.stats.interested = this.attendees.filter(a => a.status === 'interested').length;
    await this.save();
    return true;
  }
  return false;
};

// Phương thức cập nhật trạng thái tham gia
eventSchema.methods.updateAttendeeStatus = async function (userId, status) {
  const attendee = this.attendees.find(a => a.user.toString() === userId.toString());
  if (attendee) {
    attendee.status = status;
    attendee.rsvpAt = new Date();
    this.stats.attendees = this.attendees.filter(a => a.status === 'going').length;
    this.stats.interested = this.attendees.filter(a => a.status === 'interested').length;
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Event', eventSchema);