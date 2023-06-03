const Router = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

const userDAO = require('../daos/user');
const isEmailFormatValid = require('./isEmailFormatValid');
const isPasswordFormatValid = require('./isPasswordFormatValid');
const isUserAuthorized = require('./isUserAuthorized');

router.post(
  '/',
  isEmailFormatValid,
  isPasswordFormatValid,
  async (req, res, next) => {
    console.log('TEST login - post /');
    const { email, password } = req.body;
    //   const hashedPW = await bcrypt.hash(password, saltRounds).then(async (hashed) =>{
    //     console.log('hashed password')
    //     console.log(hashed)
    //   })

    try {
      // Retrieve user data from db
      const {
        _id: userId,
        email: userEmail,
        password: hashedPassword,
        roles: userRoles,
        ...otherFields
      } = await userDAO.getUserByField({ email: email });
      if (!userId) throw new userDAO.BadDataError('User not found');
      console.log('email, password');
      console.log(userEmail, hashedPassword);

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
        console.log('loginToken');
        console.log(loginToken);
        res.json({ token: loginToken });
      } else {
        throw new userDAO.BadDataError('Password does not match');
      }
    } catch (e) {
      console.log('e.message');
      console.log(e.message);
      e instanceof userDAO.BadDataError
        ? res.status(401).send(e.message)
        : res.status(500).send(e.message);
    }
  }
);

router.put(
  '/updatePassword',
  isUserAuthorized,
  isPasswordFormatValid,
  async (req, res, next) => {
    console.log('TEST login - PUT / updatePassword');
    console.log('req.user');
    console.log(req.user);

    try {
      let userId;
      if (req.user.roles.includes('admin') && req.body.userId) {
        // if user is an admin, check if target userId is valid.
        //  An error is thrown if user does not exist or id is invalid
        await userDAO.getUserByField({ _id: req.body.userId });
        userId = req.body.userId;
      } else {
        // all other users can only update their own password
        userId = req.user._id;
      }
      const newPassword = req.body.password;
      const updatedPassword = await userDAO.updatePassword(userId, newPassword);
      console.log('Password is now updated');
      console.log(updatedPassword);
      res.json(updatedPassword);
    } catch (e) {
    //   console.log('Route e');
    //   console.log(e);
      e instanceof userDAO.BadDataError
        ? res.status(400).send(e.message)
        : res.status(500).send(e.message);
    }
  }
);

module.exports = router;
