const mongoose = require('mongoose');

const validRecordTypes = ['personal', 'medical', 'employment', 'background', 'test01', 'test02'];

const userDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  recordType: {
    type: String,
    enum: validRecordTypes,
    required: true,
  },
  dataObject: { type: Object, required: true },
});

// Use compound index make a field unique
userDataSchema.index({ userId: 1, recordType: 1 }, { unique: true });

module.exports = mongoose.model('userData', userDataSchema);
