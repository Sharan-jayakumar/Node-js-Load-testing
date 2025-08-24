import http from "k6/http";
import { check } from "k6";

const TARGET = __ENV.TARGET || "http://localhost:3000/api/calculate-date";
const C = Number(__ENV.C || 100);
const N = Number(__ENV.N || 5000);

// Function to generate random dates between 1900 and 2024
function getRandomDate() {
  const startYear = 1900;
  const endYear = 2024;
  const year =
    Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid invalid dates

  // Format as DD-MM-YYYY
  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");

  return `${formattedDay}-${formattedMonth}-${year}`;
}

export const options = {
  discardResponseBodies: true,
  scenarios: {
    // Only run the specified test type
    throughputTest: {
      executor: "constant-arrival-rate",
      rate: C,
      timeUnit: "1s",
      duration: `${Math.ceil(N / C)}s`,
      preAllocatedVUs: 100,
      maxVUs: 1000,
      gracefulStop: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [
      { threshold: "p(95)<250", abortOnFail: true },
      { threshold: "p(99)<500", abortOnFail: true },
    ],
  },
};

export default function () {
  const randomDate = getRandomDate();
  const url = `${TARGET}?date=${randomDate}`;

  const res = http.get(url);
  check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });
}
