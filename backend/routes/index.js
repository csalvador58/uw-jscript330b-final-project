const { Router } = require('express');
const router = Router();

// router.use((req, res, next) => {
//   console.log(`
//   ${req.method} ${req.url}
//   Headers: ${req.headers.authorization}
//   Body: ${JSON.stringify(req.body)}
//   at ${new Date()}`);
//   next();
// });

router.use('/login', require('../routes/login'));
router.use('/admin', require('../routes/admin'));
router.use('/vendor', require('./vendor'));
router.use('/verifier', require('./verifier'));

// For deploy test only
router.get('/', (req, res, next) => {
  res.send(`
    <html>
      <body>
        <h1> Server deployed! </h1>
      </body>
    </html>
  `);
});


router.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

router.use((err, req, res, next) => {
  console.error(`Error detected: `, err);
});

module.exports = router;
