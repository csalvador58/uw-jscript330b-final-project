const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [String], required: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  vendorGroupId: { type: Number, required: true },
  verifierGroupId: { type: Number, required: true },
});

module.exports = mongoose.model('users', userSchema);
