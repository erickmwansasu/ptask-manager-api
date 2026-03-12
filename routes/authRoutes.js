const express = require('express');
const router = express.Router()

const authController = require('../controllers/authController')

router.post('/register', authController.handleUserRegistration)
router.post('/login', authController.handleUserLogin)
router.post('/refreshToken', authController.refreshToken)
router.post('/logout', authController.handleUserLogout)

module.exports = router