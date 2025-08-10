const { body } = require('express-validator');
const User = require('../models/Users');

const validateUser = [
  body('firstname')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastname')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value.trim().toLowerCase() } });
      if (user) {
        throw new Error('Email already in use');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('healthAuthority')
    .notEmpty()
    .withMessage('Health authority is required')
    .trim(),
];

module.exports = validateUser;