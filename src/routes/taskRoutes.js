const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// GET /api/tasks - Get all tasks
router.get("/", taskController.getAllTasks);

// GET /api/tasks/:id - Get task by ID
router.get("/:id", taskController.getTaskById);

// POST /api/tasks - Create new task
router.post("/", taskController.createTask);

// PUT /api/tasks/:id - Update task
router.put("/:id", taskController.updateTask);

// DELETE /api/tasks/:id - Soft delete task
router.delete("/:id", taskController.deleteTask);

module.exports = router;
