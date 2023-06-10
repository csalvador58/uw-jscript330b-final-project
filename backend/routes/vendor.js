const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const userDataDAO = require('../daos/userData');

const isUserAuthorized = require('../routes/isUserAuthorized');
const isEmailFormatValid = require('../routes/isEmailFormatValid');
const isPasswordFormatValid = require('../routes/isPasswordFormatValid');

router.use(isUserAuthorized, async (req, res, next) => {
  // console.log('TEST Vendor - middleware isUserAuthorized and has vendor role');
  if (req.user.roles.includes('vendor')) {
    next();
  } else {
    res.status(403).json({ error: 'Restricted Access' });
  }
});

router.get('/', async (req, res, next) => {
  // console.log('TEST vendor - get /');
  const dataOption = req.query.data;

  try {
    const user = dataOption
      ? await userDataDAO.getUserWithRecords(req.user._id)
      : await userDAO.getUserByField({ _id: req.user._id });
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).json({ error: e.message })
      : res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res, next) => {
  // console.log('TEST vendor - get /:id');

  try {
    const personalData = await userDataDAO.getRecordById(req.params.id);
    res.json(personalData);
  } catch (e) {
    e instanceof userDataDAO.BadDataError
      ? res.status(400).json({ error: e.message })
      : res.status(500).json({ error: e.message });
  }
});

router.post('/upload', async (req, res, next) => {
  // console.log('TEST ');

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
    res.json(uploadedData);
  } catch (e) {
    if (e.message.includes('Invalid data')) {
      res.status(400).json({ error: e.message });
    } else if (e instanceof userDataDAO.BadDataError) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

router.put('/', async (req, res, next) => {
  // console.log('TEST Vendor - put /');
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
      res.status(400).json({ error: e.message });
    } else if (e instanceof userDAO.BadDataError) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

router.delete('/:id', async (req, res, next) => {
  // console.log('Test Vendor - DELETE /:id');
  try {
    const deletedRecord = await userDataDAO.removeRecordById(req.params.id);

    res.json(deletedRecord);
  } catch (e) {
    e instanceof userDataDAO.BadDataError
      ? res.status(400).json({ error: e.message })
      : res.status(500).json({ error: e.message });
  }
});

module.exports = router;
