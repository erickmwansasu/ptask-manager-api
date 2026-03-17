const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController')

router.get('/all', taskController.getTasks)
router.get('/completed', taskController.getCompletedTasks)
router.get('/pending', taskController.getPendingTasks)
router.post('/createTask', taskController.createTask)
router.patch('/updateTask/:id', taskController.updateTask)
router.patch('/complete/:id', taskController.markComplete)
router.patch('/incomplete/:id', taskController.markIncomplete)
router.delete('/deleteTask/:id', taskController.deleteTask)

module.exports = router