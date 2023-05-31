const Router = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

const userDAO = require('../daos/user');
const isUserAuthenticated = require('./isUserAuthenticated');

router.use(async (req, res, next) => {
  console.log('TEST Login - middleware check password');
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  if (
    !password ||
    JSON.stringify(password) === '{}' ||
    !email ||
    !isValidEmail
  ) {
    res.status(400).send('Invalid email/password');
  } else {
    next();
  }
});

router.post('/', isUserAuthenticated, async (req, res, next) => {
  console.log('TEST login - post /');
  const { email, password } = req.body;

  try {
    // Retrieve user data from db
    const {
      _id: userId,
      email: userEmail,
      password: hashedPassword,
      roles: userRoles,
      ...otherFields
    } = await userDAO.getUserByField({ email: email });

    // verify password matches db
    const passwordIsValid = await bcrypt.compare(password, hashedPassword);

    if (passwordIsValid) {
      // Generate jwt token
      const loginToken = await jwt.sign(
        {
          _id: userId,
          email: userEmail,
          roles: userRoles,
        },
        secret
      );
      res.json({ token: loginToken });
    } else {
      throw new userDAO.BadDataError('Password does not match');
    }
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(401).send(e.message)
      : res.status(500).send(e.message);
  }
});

module.exports = router;
