const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const userDataDAO = require('../daos/userData');

const isUserAuthorized = require('../routes/isUserAuthorized');
const isEmailFormatValid = require('../routes/isEmailFormatValid');
const isPasswordFormatValid = require('../routes/isPasswordFormatValid');

router.use(isUserAuthorized, async (req, res, next) => {
  console.log('TEST Vendor - middleware isUserAuthorized and has vendor role');
  if (req.user.roles.includes('vendor')) {
    next();
  } else {
    res.status(403).send('Restricted Access');
  }
});

router.get('/', async (req, res, next) => {
  console.log('TEST vendor - get /');
  // console.log('req.user');
  // console.log(req.user);
  const dataOption = req.query.data;
  // console.log('dataOption');
  // console.log(dataOption);

  try {
    const user = dataOption
      ? await userDataDAO.getUserWithRecords(req.user._id)
      : await userDAO.getUserByField({ _id: req.user._id });
    // console.log('user');
    // console.log(user);
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
});

router.get('/:id', async (req, res, next) => {
  console.log('TEST vendor - get /:id');
  // console.log('req.params.id');
  // console.log(req.params.id);

  try {
    const personalData = await userDataDAO.getRecordById(req.params.id);
    // console.log('personalData');
    // console.log(personalData);
    if (!personalData) {
      return res.status(400).send('No record exist');
    }
    res.json(personalData);
  } catch (e) {
    e instanceof userDataDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
});

router.post('/upload', async (req, res, next) => {
  console.log('TEST ');
  // console.log('req.body');
  // console.log(req.body);

  try {
    // Iterate through each key in the request data object
    for (const key of Object.keys(req.body.dataObject)) {
      const value = req.body.dataObject[key];

      // Check if the value is an empty string
      if (value === '') {
        throw new Error('Invalid data');
      }
    }
    const uploadedData = await userDataDAO.uploadData(
      req.user._id,
      req.body.recordType,
      req.body.dataObject
    );
    // console.log('uploadedData');
    // console.log(uploadedData);
    res.json(uploadedData);
  } catch (e) {
    // console.log('e.message');
    // console.log(e.message);
    if (e.message.includes('Invalid data')) {
      res.status(400).send(e.message);
    } else if (e instanceof userDataDAO.BadDataError) {
      res.status(409).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
  }
});

router.put('/', async (req, res, next) => {
  console.log('TEST Vendor - put /');
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

router.delete('/:id', async (req, res, next) => {
  console.log('Test Vendor - DELETE /:id');

  try {
    const deletedRecord = await userDataDAO.removeRecordById(req.params.id);
    // console.log('deletedRecord');
    // console.log(deletedRecord);
    res.json(deletedRecord);
  } catch (e) {
    e instanceof userDataDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
});

module.exports = router;
