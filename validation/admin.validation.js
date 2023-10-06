const { body, validationResult } = require('express-validator');

exports.validateAdminCreation = [
  body('username')
    .not()
    .isEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username should be a string')
    .trim(),
  body('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password should be a string')
    .isLength({ min: 8 })
    .withMessage('Password should be at least 8 characters long'),
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isString()
    .withMessage('Full name should be a string')
    .trim(),
  
];


exports.validationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
