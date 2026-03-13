const express = require('express');
const router = express.Router()

const userController = require('../controllers/userController')

router.put('/updateProfile', userController.updateProfile)

module.exports = router