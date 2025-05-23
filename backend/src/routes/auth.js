const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

console.log('register:', register);
console.log('login:', login);
console.log('forgotPassword:', forgotPassword);
console.log('resetPassword:', resetPassword);
console.log('changePassword:', changePassword);

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;