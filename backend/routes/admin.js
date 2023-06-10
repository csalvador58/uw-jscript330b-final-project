const { Router } = require('express');
const router = Router();
const userDAO = require('../daos/user');
const userDataDAO = require('../daos/userData');
const isUserAuthorized = require('../routes/isUserAuthorized');
const isEmailFormatValid = require('../routes/isEmailFormatValid');
const isPasswordFormatValid = require('../routes/isPasswordFormatValid');

// Validate jwt token and store user in req.user
router.use(isUserAuthorized, async (req, res, next) => {
  // console.log('TEST Admin - middleware isUser Authorized and has admin role');
  if (req.user.roles.includes('admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Restricted Access' });
  }
});

// Search users by groupId
router.get('/search', async (req, res, next) => {
  // console.log('TEST Admin - get /search?groupId');
  try {
    const users = await userDAO.getUsersByGroupId(req.query.groupId);
    res.json(users);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).json({ error: e.message })
      : res.status(500).json({ error: e.message });
  }
  res.status(200);
});

// Get any user by id
router.get('/:id', async (req, res, next) => {
  // console.log('TEST Admin - get /:id');
  const userId = req.params.id;

  try {
    const user = await userDAO.getUserByField({ _id: userId });
    if (!user) {
      return res.status(400).json({ error: 'No user exist' });
    }
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).json({ error: e.message })
      : res.status(500).json({ error: e.message });
  }
});

// Get own user data
router.get('/', async (req, res, next) => {
  // console.log('TEST Admin - get /');

  try {
    const user = await userDAO.getUserByField({ _id: req.user._id });
    res.json(user);
  } catch (e) {
    e instanceof userDAO.BadDataError
      ? res.status(400).json({ error: e.message })
      : res.status(500).json({ error: e.message });
  }
});

// Create a new user
router.post(
  '/createUser',
  isEmailFormatValid,
  isPasswordFormatValid,
  async (req, res, next) => {
    // console.log('TEST Admin - post /createUser');
    const newUser = req.body;

    const phoneRegex = /^\d{10}$/;
    if (
      !newUser.roles.length ||
      !newUser.name.trim().length ||
      !phoneRegex.test(newUser.phone) ||
      !newUser.groupId
    ) {
      res.status(400).json({ error: 'Invalid data' });
    } else {
      try {
        const storedUser = await userDAO.createUser(newUser);
        res.json(storedUser);
      } catch (e) {
        e instanceof userDAO.BadDataError
          ? res.status(409).json({ error: e.message })
          : e instanceof userDAO.TypeError
          ? res.status(400).json({ error: e.message })
          : res.status(500).json({ error: e.message });
      }
    }
  }
);

// Update selected fields
router.put('/', async (req, res, next) => {
  // console.log('TEST Admin - put /');
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

// Delete a user by id
router.delete('/:id', async (req, res, next) => {
  // console.log('Test ADMIN - DELETE /:id');

  if (req.params.id === req.user._id) {
    res.status(405).json({ error: 'Not allowed to delete own user account' });
  } else {
    try {
      const isUserDeleted = await userDAO.removeUserById(req.params.id);
      res.json(isUserDeleted);
    } catch (e) {
      if (
        e instanceof userDAO.BadDataError ||
        e instanceof userDataDAO.BadDataError
      ) {
        res.status(400).json({ error: e.message });
      } else {
        res.status(500).json({ error: e.message });
      }
    }
  }
});

module.exports = router;
