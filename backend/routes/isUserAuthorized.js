const userDAO = require('../daos/user');

const isUserAuthorized = async (req, res, next) => {
  console.log('Middleware Test - isUserAuthorized');
  const tokenString = req.headers.authorization
    ? req.headers.authorization.split(' ')
    : [];

  if (tokenString[0] === 'Bearer') {
    req.user = {};

    try {
      req.user = await userDAO.verifyToken(tokenString[1]);
      req.user.isAuthorized = true;
      console.log('isUserAutho - req.user');
      console.log(req.user);
      next();
    } catch (e) {
      console.log('Error e')
      console.log(e)
      e instanceof userDAO.BadDataError
        ? res.status(401).send(e.message)
        : res.status(500).send(e.message);
    }
  } else {
    console.log('isAuthorized = false')
    req.user = { isAuthorized: false };
    next();
  }
};

module.exports = isUserAuthorized;
