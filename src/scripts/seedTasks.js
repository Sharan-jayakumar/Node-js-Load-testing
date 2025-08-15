const { Task, sequelize } = require("../models");

const sampleTasks = [
  {
    name: "Complete Project Setup",
    description: "Set up the initial project structure and dependencies",
    isCompleted: true,
  },
  {
    name: "Database Configuration",
    description: "Configure Sequelize and PostgreSQL connection",
    isCompleted: true,
  },
  {
    name: "Create Task Model",
    description: "Implement the Task model with proper schema",
    isCompleted: true,
  },
  {
    name: "API Endpoints",
    description: "Create CRUD endpoints for tasks",
    isCompleted: false,
  },
  {
    name: "Load Testing",
    description: "Implement load testing scenarios with k6",
    isCompleted: false,
  },
  {
    name: "Documentation",
    description: "Write comprehensive API documentation",
    isCompleted: false,
  },
  {
    name: "Error Handling",
    description: "Implement proper error handling and validation",
    isCompleted: false,
  },
  {
    name: "Testing",
    description: "Write unit and integration tests",
    isCompleted: false,
  },
  {
    name: "Deployment",
    description: "Prepare for production deployment",
    isCompleted: false,
  },
  {
    name: "Performance Optimization",
    description: "Optimize database queries and API performance",
    isCompleted: false,
  },
];

const seedTasks = async () => {
  try {
    console.log("🌱 Starting to seed tasks...");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Sync models (this will create the table if it doesn't exist)
    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized");

    // Check if tasks already exist
    const existingTasks = await Task.count();
    if (existingTasks > 0) {
      console.log(`⚠️  Tasks table already contains ${existingTasks} records`);
      console.log("💡 Use force: true in syncDatabase to recreate the table");
      return;
    }

    // Insert sample tasks
    const createdTasks = await Task.bulkCreate(sampleTasks);
    console.log(`✅ Successfully created ${createdTasks.length} tasks`);

    // Display created tasks
    console.log("\n📋 Created Tasks:");
    createdTasks.forEach((task, index) => {
      console.log(
        `${index + 1}. ${task.name} - ${task.isCompleted ? "✅" : "⏳"}`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding tasks:", error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seeding function
seedTasks();
