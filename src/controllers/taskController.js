const { Task } = require("../models");

class TaskController {
  // GET /api/tasks - Get all tasks
  async getAllTasks(req, res) {
    try {
      const tasks = await Task.findAll({
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // GET /api/tasks/:id - Get task by ID
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // POST /api/tasks - Create new task
  async createTask(req, res) {
    try {
      const { name, description, isCompleted } = req.body;

      const task = await Task.create({
        name,
        description,
        isCompleted: isCompleted || false,
      });

      res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // PUT /api/tasks/:id - Update task
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { name, description, isCompleted } = req.body;

      const task = await Task.findByPk(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      await task.update({
        name,
        description,
        isCompleted,
      });

      res.status(200).json({
        success: true,
        data: task,
        message: "Task updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // DELETE /api/tasks/:id - Soft delete task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      await task.destroy(); // This will set deleted_at due to paranoid: true

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new TaskController();
