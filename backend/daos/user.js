const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports = {};

module.exports.createUser = async (userObj) => {
  return new Promise((resolve, reject) => {
    // code here
  });
};

module.exports.getUserByField = async (keyValuePair) => {
  try {
    const user = await User.findOne(keyValuePair).lean();
    if (user) {
      return user;
    } else throw new Error('User does not exist');
  } catch (e) {
    if (e.message.includes('User does not exist')) {
      throw new BadDataError(e.message);
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.verifyToken = async (token) => {
  try {
    return await jwt.verify(token, secret);
  } catch (e) {
    throw new BadDataError(`Invalid token: ${e.message}`);
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
