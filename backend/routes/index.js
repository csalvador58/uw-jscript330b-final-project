const { Router } = require('mongoose');
const router = Router();

router.use((err, req, res, next) => {
  console.error(`Error detected: `, err);
});

module.exports = router;
