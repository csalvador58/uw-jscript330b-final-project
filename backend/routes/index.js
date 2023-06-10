const { Router } = require('express');
const router = Router();

router.use((req, res, next) => {
  console.log(`
  ${req.method} ${req.url} 
  Headers: ${req.headers.authorization}
  Body: ${JSON.stringify(req.body)}
  at ${new Date()}`);
  next();
});

router.use('/login', require('../routes/login'));
router.use('/admin', require('../routes/admin'));
router.use('/vendor', require('./vendor'));
router.use('/verifier', require('./verifier'));

router.use((err, req, res, next) => {
  console.error(`Error detected: `, err);
});

module.exports = router;
