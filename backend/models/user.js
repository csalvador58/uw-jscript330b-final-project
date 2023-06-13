const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [String], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  groupId: { type: Number, required: true },
});

// create text index
userSchema.index({ name: 'text', groupId: 'text' });

module.exports = mongoose.model('users', userSchema);
