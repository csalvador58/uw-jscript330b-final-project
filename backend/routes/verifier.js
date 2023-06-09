const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const userDataDAO = require('../daos/userData');
const zkTestAPI = require('../apis/zkTestAPI');

const isUserAuthorized = require('../routes/isUserAuthorized');
const isEmailFormatValid = require('../routes/isEmailFormatValid');
const isPasswordFormatValid = require('../routes/isPasswordFormatValid');

router.use(isUserAuthorized, async (req, res, next) => {
  // console.log('TEST Verifier - middleware isUserAuthorized and has verifier role');
  if (req.user.roles.includes('verifier')) {
    next();
  } else {
    res.status(403).send('Restricted Access');
  }
});

router.get('/', async (req, res, next) => {
  'TEST Verifier - get /';

  try {
    const user = await userDAO.getUserByField({ _id: req.user._id });
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
});

router.post('/:id', async (req, res, next) => {
  // console.log('TEST Verifier - post /');

  const recordId = req.params.id;
  const zkProofRelatedObject = req.body;

  if (!zkProofRelatedObject || JSON.stringify(zkProofRelatedObject) === '{}') {
    res.status(400).send('Invalid request');
  } else {
    try {
      let userRecord = await userDataDAO.getRecordById(recordId);
      userRecord = {
        ...userRecord,
        proof: zkProofRelatedObject,
      };
      const isProofValid = await zkTestAPI.validateUserRecord(userRecord);
      res.status(200).send({ results: isProofValid });
    } catch (e) {
      e instanceof userDataDAO.BadDataError
        ? res.status(400).send(e.message)
        : res.status(500).send(e.message);
    }
  }
});

router.put('/', async (req, res, next) => {
  // console.log('TEST Verifier - put /');
  const updateUserData = req.body;
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
    res.json(updatedUser);
  } catch (e) {
    if (e.message.includes('Invalid')) {
      res.status(400).send(e.message);
    } else if (e instanceof userDAO.BadDataError) {
      res.status(409).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
  }
});

module.exports = router;
