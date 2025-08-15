const express = require("express");
const router = express.Router();
const dateController = require("../controllers/dateController");
const {
  validateDateQuery,
  handleValidationErrors,
} = require("../middlewares/dateValidation");

// GET /api/calculate-date?date=05-03-2001
router.get(
  "/calculate-date",
  validateDateQuery,
  handleValidationErrors,
  dateController.calculateDate
);

module.exports = router;
