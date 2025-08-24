import http from "k6/http";
import { check } from "k6";

const TARGET = __ENV.TARGET || "http://localhost:3000/api/calculate-date";
const C = Number(__ENV.C || 100);
const N = Number(__ENV.N || 5000);

// ... existing getRandomDate function ...

export const options = {
  discardResponseBodies: true,
  scenarios: {
    concurrencyTest: {
      executor: "constant-vus",
      vus: C,
      duration: "30s",
      gracefulStop: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250", "p(99)<500"],
  },
};

export default function () {
  const randomDate = getRandomDate();
  const url = `${TARGET}?date=${randomDate}`;
  const res = http.get(url);
  check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });
}
