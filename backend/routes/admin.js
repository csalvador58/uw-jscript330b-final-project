const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const isUserAuthorized = require('../routes/isUserAuthorized');
const isEmailFormatValid = require('../routes/isEmailFormatValid');
const isPasswordFormatValid = require('../routes/isPasswordFormatValid');

router.use(isUserAuthorized, async (req, res, next) => {
  console.log('TEST Admin - middleware isUser Authorized and has admin role');
  if (req.user.roles.includes('admin')) {
    next();
  } else {
    res.status(403).send('Restricted Access');
  }
});

router.get('/search', async (req, res, next) => {
  console.log('TEST Admin - get /search?groupId');

  try {
    const users = await userDAO.getUsersByGroupId(req.query.groupId);
    res.json(users);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
  res.status(200);
});

router.get('/:id', async (req, res, next) => {
  console.log('TEST Admin - get /:id');
  const userId = req.params.id;
  // console.log('userId');
  // console.log(userId);
  // console.log('req.user.roles');
  // console.log(req.user.roles);

  try {
    const user = await userDAO.getUserByField({ _id: userId });
    // console.log('user');
    // console.log(user);
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).send(e.message)
      : res.status(500).send(e.message);
  }
});

router.get('/', async (req, res, next) => {
  console.log('TEST Admin - get /');
  // console.log('req.user');
  // console.log(req.user);
  // console.log('req.user.roles');
  // console.log(req.user.roles);

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

router.post(
  '/createUser',
  isEmailFormatValid,
  isPasswordFormatValid,
  async (req, res, next) => {
    console.log('TEST Admin - post /createUser');
    const newUser = req.body;
    // console.log('newUser');
    // console.log(newUser);
    // console.log('req.user');
    // console.log(req.user);

    const phoneRegex = /^\d{10}$/;
    if (
      !newUser.roles.length ||
      !newUser.name.trim().length ||
      !phoneRegex.test(newUser.phone) ||
      !newUser.groupId
    ) {
      res.status(400).send('Invalid data');
    } else {
      try {
        const storedUser = await userDAO.createUser(newUser);
        // console.log('storedUser');
        // console.log(storedUser);
        res.json(storedUser);
      } catch (e) {
        console.log(e.message);
        e instanceof userDAO.BadDataError
          ? res.status(409).send(e.message)
          : res.status(500).send(e.message);
      }
    }
  }
);

router.put('/', async (req, res, next) => {
  console.log('TEST Admin - put /');
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
    if (req.body.roles) {
      if (Array.isArray(req.body.roles)) {
        throw new Error('Invalid roles');
      }
      updatedFields = {
        ...updatedFields,
        roles: req.body.roles,
      };
    }
    if (req.body.name) {
      if (!req.body.name.trim().length) {
        throw new Error('Invalid name');
      }
      updatedFields = {
        ...updatedFields,
        name: req.body.name,
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
    if (req.body.groupId) {
      if (typeof req.body.groupId !== 'number') {
        throw new Error('Invalid groupId');
      }
      updatedFields = {
        ...updatedFields,
        groupId: req.body.groupId,
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
