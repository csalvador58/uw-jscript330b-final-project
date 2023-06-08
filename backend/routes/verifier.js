const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const userDataDAO = require('../daos/userData');

const isUserAuthorized = require('../routes/isUserAuthorized');
const isEmailFormatValid = require('../routes/isEmailFormatValid');
const isPasswordFormatValid = require('../routes/isPasswordFormatValid');

router.use(isUserAuthorized, async (req, res, next) => {
  console.log(
    'TEST Verifier - middleware isUserAuthorized and has verifier role'
  );
  if (req.user.roles.includes('verifier')) {
    next();
  } else {
    res.status(403).send('Restricted Access');
  }
});

router.get('/', async (req, res, next) => {
  'TEST Verifier - get /';
  // console.log('req.user');
  // console.log(req.user);

  try {
    const user = await userDAO.getUserByField({ _id: req.user._id });
    // console.log('user');
    // console.log(user);
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
});

router.put('/', async (req, res, next) => {
  console.log('TEST Verifier - put /');
  const updateUserData = req.body;
  // console.log('updateUserData');
  // console.log(updateUserData);
  // console.log('req.user');
  // console.log(req.user);

  let updatedFields = {};

  try {
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailFormatValid = emailRegex.test(req.body.email);
      if (!isEmailFormatValid) {
        throw new Error('Invalid email');
      }
      updatedFields = {
        ...updatedFields,
        email: req.body.email,
      };
    }
    if (req.body.password) {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[^\s]{6,}$/;
      const isPasswordFormatValid = passwordRegex.test(req.body.password);
      if (!isPasswordFormatValid) {
        throw new Error('Invalid password');
      }
      updatedFields = {
        ...updatedFields,
        password: req.body.password,
      };
    }
    if (req.body.phone) {
      const phoneRegex = /^\d{10}$/;
      const isPhoneFormatValid = phoneRegex.test(req.body.phone);
      if (!isPhoneFormatValid) {
        throw new Error('Invalid phone');
      }
      updatedFields = {
        ...updatedFields,
        phone: req.body.phone,
      };
    }

    const updatedUser = await userDAO.updateUser(req.user._id, updatedFields);
    // console.log('updatedUser');
    // console.log(updatedUser);
    res.json(updatedUser);
  } catch (e) {
    if (e.message.includes('Invalid')) {
      res.status(400).send(e.message);
    } else if (e instanceof userDAO.BadDataError) {
      res.status(409).send(e.message);
    } else {
      // console.log('PUT Error');
      // console.log(e);
      res.status(500).send(e.message);
    }
  }
});

module.exports = router;
