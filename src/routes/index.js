const express = require("express");
const router = express.Router();

// Import other route files
const dateRoutes = require("./dateRoutes");
const taskRoutes = require("./taskRoutes");

// Base route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      tasks: "/api/tasks",
    },
  });
});

// Mount other routes
router.use("/", dateRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
