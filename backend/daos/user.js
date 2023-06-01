const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

module.exports = {};

module.exports.createUser = (newUserObj) => {
  return new Promise(async (resolve, reject) => {
    try {
      const storedUser = await User.create(newUserObj);
      resolve(storedUser);
    } catch (e) {
      if (e.message.includes('duplicate key')) {
        reject(new BadDataError('Email already exist'));
      } else {
        reject(new Error(e.message));
      }
    }
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
