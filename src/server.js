const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes and database
const indexRoutes = require("./routes/index");
const { testConnection, syncDatabase } = require("./config/database");

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api", indexRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("🔄 Initializing database connection...");

    // Test database connection with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        await testConnection();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(
            "Failed to connect to database after multiple attempts"
          );
        }
        console.log(
          `⚠️  Database connection failed, retrying in 5 seconds... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    // Sync database models
    await syncDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api`);
      console.log(`🗄️  Database: PostgreSQL connected and synchronized`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
