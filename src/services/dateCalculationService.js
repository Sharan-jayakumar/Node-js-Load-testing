class DateCalculationService {
  calculateTimeDifference(dateString) {
    try {
      // Parse the input date (DD-MM-YYYY format)
      const [day, month, year] = dateString.split("-");
      const inputDate = new Date(year, month - 1, day);
      const currentDate = new Date();

      // Calculate the difference in milliseconds
      const timeDifference = currentDate.getTime() - inputDate.getTime();

      // Convert to different time units
      const minutes = Math.floor(timeDifference / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      // Calculate years, months, and remaining days
      let years = currentDate.getFullYear() - inputDate.getFullYear();
      let months = currentDate.getMonth() - inputDate.getMonth();
      let remainingDays = currentDate.getDate() - inputDate.getDate();

      // Adjust for negative months or days
      if (remainingDays < 0) {
        months--;
        // Get the last day of the previous month
        const lastMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        remainingDays += lastMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      // Calculate remaining hours and minutes
      const remainingHours = hours % 24;
      const remainingMinutes = minutes % 60;

      return {
        years,
        months,
        days: remainingDays,
        hours: remainingHours,
        minutes: remainingMinutes,
        totalDays: days,
        totalHours: hours,
        totalMinutes: minutes,
      };
    } catch (error) {
      throw new Error(`Error calculating date difference: ${error.message}`);
    }
  }

  // Helper method to format the result
  formatResult(dateString) {
    const result = this.calculateTimeDifference(dateString);

    return {
      inputDate: dateString,
      currentDate: new Date().toISOString().split("T")[0],
      timeDifference: {
        years: result.years,
        months: result.months,
        days: result.days,
        hours: result.hours,
        minutes: result.minutes,
      },
      total: {
        totalDays: result.totalDays,
        totalHours: result.totalHours,
        totalMinutes: result.totalMinutes,
      },
    };
  }
}

module.exports = new DateCalculationService();
