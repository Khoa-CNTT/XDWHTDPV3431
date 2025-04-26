const express = require('express');
const router = express.Router();
const charityNeedController = require('../controllers/charityNeedController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', charityNeedController.getAllCharityNeeds);
router.post('/', authMiddleware, charityNeedController.createCharityNeed);

module.exports = router;