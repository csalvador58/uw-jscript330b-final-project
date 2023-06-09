const isEmailFormatValid = (req, res, next) => {
  // console.log('Middleware Test - isEmailFormatValid');

  const { email } = req.body;
  // Regex to test valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailFormatValid = emailRegex.test(email);

  if ( !email || !isEmailFormatValid) {
    res.status(400).send('Invalid email');
  } else {
    next();
  }
};

module.exports = isEmailFormatValid;
