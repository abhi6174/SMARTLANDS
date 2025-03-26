const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/check-wallet', authController.checkWallet);

module.exports = router;