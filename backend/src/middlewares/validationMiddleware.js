const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    const errorDetails = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value,
      location: err.location
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errorDetails
      }
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .notEmpty()
    .withMessage('Name is required'),
  validate
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

const charityNeedValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('organization_name')
    .notEmpty()
    .withMessage('Organization name is required'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  body('target_group')
    .notEmpty()
    .withMessage('Target group is required'),
  body('items_needed')
    .notEmpty()
    .withMessage('Items needed is required'),
  body('funding_goal')
    .isNumeric()
    .withMessage('Funding goal must be a number'),
  validate
];

const contributionValidation = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('need_id')
    .isInt()
    .withMessage('Need ID must be an integer'),
  validate
];

const feedbackValidation = [
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  validate
];

const evaluationValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('need_id')
    .isInt()
    .withMessage('Need ID must be an integer'),
  validate
];

const walletAddressValidation = [
  (req, res, next) => {
    console.log('Validating wallet address request:', req.body);
    next();
  },
  body('wallet_address')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isString()
    .withMessage('Wallet address must be a string')
    .custom((value) => {
      console.log('Validating wallet address:', value);
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(value);
      if (!isValid) {
        throw new Error('Invalid wallet address format. Address must start with 0x followed by 40 hexadecimal characters');
      }
      return true;
    }),
  (req, res, next) => {
    console.log('Wallet address validation passed');
    next();
  },
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  charityNeedValidation,
  contributionValidation,
  feedbackValidation,
  evaluationValidation,
  walletAddressValidation
}; 