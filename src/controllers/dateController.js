const dateCalculationService = require("../services/dateCalculationService");

class DateController {
  // GET /api/calculate-date
  async calculateDate(req, res) {
    try {
      const { date } = req.query;

      // The validation middleware ensures date is valid
      const result = dateCalculationService.formatResult(date);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new DateController();
