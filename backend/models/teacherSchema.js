const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'Teacher',
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin',
      required: true,
    },
    teachSubject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subject',
    },
    teachSclass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sclass',
      required: true,
    },
    attendance: [
      {
        date: {
          type: Date,
          required: true,
        },
        presentCount: {
          type: Number,
          default: 0,
        },
        absentCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

// Optional: Index
teacherSchema.index({ school: 1, teachSclass: 1 });

// Pre-save cleanup
teacherSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase().trim();
  next();
});

module.exports = mongoose.model('teacher', teacherSchema);
