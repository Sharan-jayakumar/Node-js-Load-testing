const { sequelize } = require("../config/database");
const Task = require("./Task");

// Export models
module.exports = {
  sequelize,
  Task,
};
