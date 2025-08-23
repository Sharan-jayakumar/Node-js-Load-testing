# K6 Load Testing & Monitoring Guide

## **Configuration**

- **N (Total Requests per run)**: 5000 (constant)
- **C (Concurrency)**: Incremental per run → 100, 200, 500, 1000
- **Thresholds**:
  - Error rate `< 1%`
  - p90 latency `< 250 ms`
  - p95 latency `< 500 ms`
- **Max Duration**: 5 minutes (extend if endpoint is slow)

---

## **1. k6 Test Script**

Create `test.js`:

```js
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
    http_req_duration: ["p(90)<250", "p(95)<500"],
  },
};

export default function () {
  const randomDate = getRandomDate();
  const url = `${TARGET}?date=${randomDate}`;

  const res = http.get(url);
  check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });
}
```

Run a single test:

```bash
k6 run load_test.js -e N=5000 -e C=100 --summary-export test_reports/out_c100.json
```

---

## **2. Sweep Concurrency Values**

```bash
for c in 100 200 500 1000; do
  k6 run load_test.js \
    -e N=5000 -e C=$c -e MAXD=5m \
    --summary-export "test_reports/out_c${c}.json"
done
```

---

## **3. Convert k6 JSON Outputs to CSV**

```bash
echo "concurrency,total_requests,rps,approx_duration_s,error_rate,p95_ms,p99_ms" > k6_summary.csv
for f in out_c*.json; do
  c=$(echo "$f" | sed -E 's/.*out_c([0-9]+).json/\1/')
  count=$(jq '.metrics.http_reqs.count' "$f")
  rps=$(jq '.metrics.http_reqs.rate' "$f")
  err=$(jq '.metrics.http_req_failed.rate' "$f")
  p95=$(jq '.metrics.http_req_duration.percentiles["95.0"]' "$f")
  p99=$(jq '.metrics.http_req_duration.percentiles["99.0"]' "$f")
  dur=$(python3 - <<EOF
count=$count; rps=$rps
print(round(count/ rps, 3) if rps>0 else 0)
EOF
)
  echo "$c,$count,$rps,$dur,$err,$p95,$p99" >> k6_summary.csv
done
```

---

## **4. CPU/RAM Monitoring Scripts**

### **Host-based Monitoring (non-Docker)**

### **Docker Container Monitoring**

```bash
#!/usr/bin/env bash
# monitor_docker.sh
# Usage: ./monitor_docker.sh web db > usage_docker.csv
echo "ts,container,cpu_perc,mem_used,mem_limit,mem_perc,net_io,blk_io"
while :; do
  ts=$(date +%s)
  docker stats --no-stream --format \
'{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}}' "$@" \
  | while IFS=, read -r name cpu mem mempct net blk; do
      echo "$ts,$name,$cpu,$mem,$mempct,$net,$blk"
    done
  sleep 1
done
```

Run:

```bash
./monitor_docker.sh node-load-testing-app > test_reports/usage_c100.csv & MON_PID=$!
k6 run load_test.js -e N=5000 -e C=100 --summary-export test_reports/out_c100.json
kill $MON_PID
```

---

## **5. Recommended Scenarios**

**CPU-light:**

1. Node.js + Express (single)
2. Node.js + Express + PM2 (4 cores)
3. NestJS + Fastify (single)
4. NestJS + Fastify + PM2 (4 cores)
5. Rails + Puma (single)
6. Rails + Puma (cluster: 4 cores)

**DB-read:**

1. Node.js + Express + Sequelize (single)
2. Node.js + Express + Sequelize + PM2 (2 cores)
3. NestJS + Fastify + TypeORM (single)
4. NestJS + Fastify + TypeORM + PM2 (2 cores)
5. Rails + Puma + ActiveRecord (single)
6. Rails + Puma + ActiveRecord (cluster: 2 cores)

---

## **6. Dockerization Advice**

- **Not mandatory** for local M1 testing.
- Native runs → better raw performance readings.
- Use Docker **only if**:
  - You want reproducible resource limits per service.
  - You want to mimic production container behavior.
- If containerizing:
  - Use arm64 images.
  - Allocate \~2 cores / 4GB to Docker Desktop.
  - Set per-container CPU/mem limits.

---

## **7. Run Order per Scenario**

1. Start monitoring: `./monitor.sh usage_c${C}.csv & MON_PID=$!` *(or ****\`\`**** for Docker)*
2. Run k6: `k6 run test.js -e TARGET=... -e PATH=... -e N=5000 -e C=${C} --summary-export out_c${C}.json`
3. Stop monitoring: `kill $MON_PID`
4. Repeat for all C values.
5. Extract CSV after all runs.

