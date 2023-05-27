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
});

module.exports = mongoose.model('userData', userDataSchema);
