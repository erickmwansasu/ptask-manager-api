const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers)
router.post('/user', adminController.createUser)
router.patch('/user/:id', adminController.updateUser)
router.delete('/user/:id', adminController.deleteUser)
//router.get('/tasks', adminController.getTasks)
router.patch('/duedate/:id', adminController.extendDueDate)

module.exports = router;