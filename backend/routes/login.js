const Router = require('express');
const router = Router();

const userDao = require('../daos/user');

module.exports.post('/', async () => {
  console.log('TEST login - post /');
});

module.exports = router;
