const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

module.exports = {};

module.exports.verifyToken = async (token) => {
  try {
    return await jwt.verify(token, secret);
  } catch (e) {
    throw new BadDataError(`Invalid token: ${e.message}`);
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
