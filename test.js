import http from "k6/http";
import { check } from "k6";

const TARGET = __ENV.TARGET || "http://localhost:3000";
const PATH = __ENV.PATH || "/health";
const C = Number(__ENV.C || 100);
const N = Number(__ENV.N || 5000);

export const options = {
  scenarios: {
    fixedN: {
      executor: "shared-iterations",
      vus: C,
      iterations: N,
      maxDuration: __ENV.MAXD || "5m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250", "p(99)<500"],
  },
};


export default function () {
  const res = http.get(`${TARGET}${PATH}`);
  check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });
}
