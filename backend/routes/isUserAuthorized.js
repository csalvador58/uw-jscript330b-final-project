const userDAO = require('../daos/user');
const jwt = require('jsonwebtoken');
// secret will not be visible in code
const secret = 'secretKey';

const isUserAuthorized = async (req, res, next) => {
  // console.log('Middleware Test - isUserAuthorized');

  if (req.headers.authorization.split(' ')[0] === 'Bearer') {
    req.user = {};
    try {
      const tokenString = req.headers.authorization.split(' ')[1];
      req.user = await jwt.verify(tokenString, secret);
      next();
    } catch (e) {
      return res.status(401).send('Invalid token');
    }
  } else {
    return res.status(401).send('Invalid token');
  }
};

module.exports = isUserAuthorized;
