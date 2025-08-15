const { query, validationResult } = require("express-validator");

// Validation rules for date query parameter
const validateDateQuery = [
  query("date")
    .notEmpty()
    .withMessage("Date parameter is required")
    .matches(/^\d{2}-\d{2}-\d{4}$/)
    .withMessage("Date must be in DD-MM-YYYY format (e.g., 05-03-2001)")
    .custom((value) => {
      const [day, month, year] = value.split("-");
      const date = new Date(year, month - 1, day);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Check if date is not in the future
      if (date > new Date()) {
        throw new Error("Date cannot be in the future");
      }

      return true;
    }),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateDateQuery,
  handleValidationErrors,
};
