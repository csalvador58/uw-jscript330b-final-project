const userDAO = require('../daos/user');
const jwt = require('jsonwebtoken');
// secret will not be visible in code
const secret = 'secretKey';

// Validate jwt token
const isUserAuthorized = async (req, res, next) => {
  // console.log('Middleware Test - isUserAuthorized');

  try {
    req.user = {};
    if (req.headers.authorization.split(' ')[0] === 'Bearer') {
      const tokenString = req.headers.authorization.split(' ')[1];
      req.user = await jwt.verify(tokenString, secret);
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = isUserAuthorized;
