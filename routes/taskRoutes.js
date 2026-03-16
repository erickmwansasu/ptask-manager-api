const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController')

router.get('/getTasks', taskController.getTasks)
router.post('/createTask', taskController.createTask)
router.patch('/updateTask/:id', taskController.updateTask)
router.delete('/deleteTask/:id', taskController.deleteTask)

module.exports = router