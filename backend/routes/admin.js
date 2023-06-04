const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const isUserAuthorized = require('../routes/isUserAuthorized');

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
  console.log('userId');
  console.log(userId);
  console.log('req.user.roles');
  console.log(req.user.roles);

    try {
      const user = await userDAO.getUserByField({ _id: userId });
      console.log('user');
      console.log(user);
      res.json(user);
    } catch (e) {
      e instanceof userDAO.BadDataError
        ? res.status(400).send(e.message)
        : res.status(500).send(e.message);
    }
});

router.get('/', async (req, res, next) => {
  console.log('TEST Admin - get /');
  console.log('req.user');
  console.log(req.user);
  console.log('req.user.roles');
  console.log(req.user.roles);

    try {
      const user = await userDAO.getUserByField({ _id: req.user._id });
      console.log('user');
      console.log(user);
      res.json(user);
    } catch (e) {
      e instanceof userDAO.BadDataError
        ? res.status(400).send(e.message)
        : res.status(500).send(e.message);
    }
});

router.post('/createUser', async (req, res, next) => {
  console.log('TEST Admin - post /createUser');
  const newUser = req.body;
  console.log('req.user');
  console.log(req.user);

    try {
      const storedUser = await userDAO.createUser(newUser);
      console.log('storedUser');
      console.log(storedUser);
      res.json(storedUser);
    } catch (e) {
      res.status(500).send(e.message);
    }
});

module.exports = router;
