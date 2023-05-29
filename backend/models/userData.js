const mongoose = require('mongoose');

const validDataKeys = ['personalData01', 'personalData02', 'personalData03'];

const userDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  personalData: {
    type: Map,
    of: {
      type: String,
      enum: validDataKeys,
    },
  },
  data: { type: String },
});

// Use compound index make a field unique
userDataSchema.index({ userId: 1, personalData: 1 }, { unique: true });

module.exports = mongoose.model('userData', userDataSchema);
