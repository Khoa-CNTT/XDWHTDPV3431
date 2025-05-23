const { body, validationResult } = require('express-validator');

const validateWalletAddress = (req, res, next) => {
  console.log('Validating wallet address request:', req.body);
  
  const { wallet_address } = req.body;
  
  if (!wallet_address) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: [{
          field: 'wallet_address',
          message: 'Wallet address is required',
          location: 'body'
        }]
      }
    });
  }

  if (typeof wallet_address !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: [{
          field: 'wallet_address',
          message: 'Wallet address must be a string',
          location: 'body'
        }]
      }
    });
  }

  const isValid = /^0x[a-fA-F0-9]{40}$/.test(wallet_address);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: [{
          field: 'wallet_address',
          message: 'Invalid wallet address format. Address must start with 0x followed by 40 hexadecimal characters',
          location: 'body'
        }]
      }
    });
  }

  console.log('Wallet address validation passed');
  next();
};

module.exports = {
  validateWalletAddress
}; 