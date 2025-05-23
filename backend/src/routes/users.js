const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  register,
  updateWalletAddress,
  getProfile
} = require('../controllers/userController');
const { authMiddleware, authorizeRole } = require('../middlewares/authMiddleware');
const { registerValidation, loginValidation } = require('../middlewares/validationMiddleware');
const { validateWalletAddress } = require('../middlewares/walletMiddleware');

// Public routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.get('/', authMiddleware, authorizeRole(['admin']), getAllUsers);

// Wallet route - must be before generic routes
router.put('/wallet', authMiddleware, validateWalletAddress, updateWalletAddress);

// Generic routes
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, registerValidation, updateUser);
router.delete('/:id', authMiddleware, authorizeRole(['admin']), deleteUser);

module.exports = router;