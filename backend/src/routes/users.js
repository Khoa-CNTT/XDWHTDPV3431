const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  register
} = require('../controllers/userController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const { validateUser, validateLogin } = require('../middleware/validationMiddleware');

// Public routes
router.post('/login', validateLogin, login);
router.post('/register', validateUser, register);

// Protected routes
router.get('/', authMiddleware, authorizeRole(['admin']), getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, validateUser, updateUser);
router.delete('/:id', authMiddleware, authorizeRole(['admin']), deleteUser);

module.exports = router;