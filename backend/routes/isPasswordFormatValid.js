const isPasswordFormatValid = (req, res, next) => {
    // console.log('Middleware Test - isPasswordFormatValid');
  
    const { password } = req.body;
    // Regex to ensure password is at minimum 6 characters, includes at least
    //  one number and special character, does not have any spaces
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[^\s]{6,}$/;
    const isPasswordFormatValid = passwordRegex.test(password);
    if (!password || !isPasswordFormatValid) {
      res.status(400).send('Invalid password');
    } else {
      next();
    }
  };
  
  module.exports = isPasswordFormatValid;