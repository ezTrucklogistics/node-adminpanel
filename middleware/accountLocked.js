const User = require('../models/user.model'); // Import your user model



exports.loginMiddleware = async (req, res, next) => {

  try {
    
    const reqBody = req.body
    const user = await User.findOne({ mobile_number: reqBody.mobile_number });

    if (!user) {
      console.log(user.failedLoginAttempts++)
      user.failedLoginAttempts++;
      if (user.failedLoginAttempts >= 3) {
        user.isLockedOut = true;
        user.lockoutTime = new Date(Date.now() + 5 * 60 * 1000); // Lockout for 5 minutes
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    if (user.isLockedOut) {
      const lockoutDuration = user.lockoutTime - new Date();
      console.log(lockoutDuration)
      return res.status(401).json({
        message: `Account locked. Try again in ${lockoutDuration / 1000} seconds.`,
      });
    }

    // Continue to the next middleware
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


