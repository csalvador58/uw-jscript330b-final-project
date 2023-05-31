const userDAO = require('../daos/user');

const isUserAuthenticated = async (req, res, next) => {
  console.log('Middleware Test - isUserAuthenticated');
  const tokenString = req.headers.authorization
    ? req.headers.authorization.split(' ')
    : [];

  if (tokenString[0] === 'Bearer') {
    req.user = {};

    try {
      req.user = await userDAO.verifyToken(tokenString[1]);
      req.user.isAuthorized = true;
      next();
    } catch (e) {
      e instanceof userDAO.BadDataError
        ? res.status(401).send(e.message)
        : res.status(500).send(e.message);
    }
  } else {
    req.user = { isAuthorized: false };
    next();
  }
};

module.exports = isUserAuthenticated;
