# K6 Load Testing & Monitoring Guide

## **Configuration**

- **N (Total Requests per run)**: 5000 (constant)
- **C (Concurrency)**: Incremental per run → 100, 200, 500, 1000
- **Thresholds**:
  - Error rate `< 1%`
  - p95 latency `< 250 ms`
  - p99 latency `< 500 ms`
- **Max Duration**: 5 minutes (extend if endpoint is slow)

---

## **1. k6 Test Scripts**

### **Throughput Testing (RPS-based)**

Create `throughput_test.js`:

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
  discardResponseBodies: true,
  scenarios: {
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
```

### **Concurrency Testing (VU-based)**

Create `concurrency_test.js`:

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
  discardResponseBodies: true,
  scenarios: {
    concurrencyTest: {
      executor: "constant-vus",
      vus: C,
      duration: "30s", // Fixed duration for concurrency
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
```

### **Run Tests**

**Throughput Testing (RPS-based):**

```bash
k6 run throughput_test.js -e N=5000 -e C=500 --summary-export test_reports/out_r500.json
```

**Concurrency Testing (VU-based):**

```bash
k6 run concurrency_test.js -e N=5000 -e C=500 --summary-export test_reports/out_c500.json
```

---

## **2. Sweep Concurrency Values**

### **Throughput Testing Sweep:**

```bash
for c in 500 600 1000 2000; do
  k6 run throughput_test.js \
    -e N=5000 -e C=$c \
    --summary-export "test_reports/out_r${c}.json"
done
```

### **Concurrency Testing Sweep:**

```bash
for c in 500 600 1000 2000; do
  k6 run concurrency_test.js \
    -e N=5000 -e C=$c \
    --summary-export "test_reports/out_c${c}.json"
done
```

---

## **3. Convert k6 JSON Outputs to CSV**

### **For Throughput Tests (out_r\*.json):**

```bash
echo "concurrency,total_requests,rps,approx_duration_s,error_rate,p90_ms,p95_ms,avg_ms,max_ms" > test_reports/throughput_summary.csv
for f in test_reports/out_r*.json; do
  c=$(sed -E 's/.*out_r([0-9]+)\.json/\1/' <<<"$f")

  count=$(jq -r '.metrics.http_reqs.count // 0' "$f")
  rps=$(jq -r '.metrics.http_reqs.rate // 0' "$f")

  # Convert error rate from decimal (0-1) to percentage (0.00-100.00)
  failed_decimal=$(jq -r '.metrics.http_req_failed.value // 0' "$f")
  err=$(awk -v failed="$failed_decimal" 'BEGIN {printf "%.2f", failed*100}')

  # Prefer successful responses bucket if present, else overall
  p90=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["p(90)"]? //
    .metrics.http_req_duration["p(90)"]? //
    ""' "$f")

  p95=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["p(95)"]? //
    .metrics.http_req_duration["p(95)"]? //
    ""' "$f")

  # Get average and max request duration
  avg=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["avg"]? //
    .metrics.http_req_duration["avg"]? //
    ""' "$f")

  max=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["max"]? //
    .metrics.http_req_duration["max"]? //
    ""' "$f")

  # Approx duration = total_requests / rps (rounded to 3 decimals)
  dur=$(jq -r '
    (.metrics.http_reqs.count // 0) as $c |
    (.metrics.http_reqs.rate  // 0) as $r |
    if $r > 0 then ((($c / $r) * 1000 | round) / 1000) else 0 end
  ' "$f")

  echo "$c,$count,$rps,$dur,$err,$p90,$p95,$avg,$max" >> test_reports/throughput_summary.csv
done
```

### **For Concurrency Tests (out_c\*.json):**

```bash
echo "concurrency,total_requests,rps,approx_duration_s,error_rate,p90_ms,p95_ms,avg_ms,max_ms" > test_reports/concurrency_summary.csv
for f in test_reports/out_c*.json; do
  c=$(sed -E 's/.*out_c([0-9]+)\.json/\1/' <<<"$f")

  count=$(jq -r '.metrics.http_reqs.count // 0' "$f")
  rps=$(jq -r '.metrics.http_reqs.rate // 0' "$f")

  # Convert error rate from decimal (0-1) to percentage (0.00-100.00)
  failed_decimal=$(jq -r '.metrics.http_req_failed.value // 0' "$f")
  err=$(awk -v failed="$failed_decimal" 'BEGIN {printf "%.2f", failed*100}')

  # Prefer successful responses bucket if present, else overall
  p90=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["p(90)"]? //
    .metrics.http_req_duration["p(90)"]? //
    ""' "$f")

  p95=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["p(95)"]? //
    .metrics.http_req_duration["p(95)"]? //
    ""' "$f")

  # Get average and max request duration
  avg=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["avg"]? //
    .metrics.http_req_duration["avg"]? //
    ""' "$f")

  max=$(jq -r '
    .metrics["http_req_duration{expected_response:true}"]["max"]? //
    .metrics.http_req_duration["max"]? //
    ""' "$f")

  # Approx duration = total_requests / rps (rounded to 3 decimals)
  dur=$(jq -r '
    (.metrics.http_reqs.count // 0) as $c |
    (.metrics.http_reqs.rate  // 0) as $r |
    if $r > 0 then ((($c / $r) * 1000 | round) / 1000) else 0 end
  ' "$f")

  echo "$c,$count,$rps,$dur,$err,$p90,$p95,$avg,$max" >> test_reports/concurrency_summary.csv
done
```

---

## **4. CPU/RAM Monitoring Scripts**

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

### **Run Monitoring with Tests:**

**Throughput Testing:**

```bash
./monitor_docker.sh node-load-testing-app > test_reports/usage_r500.csv & MON_PID=$!
k6 run throughput_test.js -e N=5000 -e C=500 --summary-export test_reports/out_r500.json
kill $MON_PID
```

**Concurrency Testing:**

```bash
./monitor_docker.sh node-load-testing-app > test_reports/usage_c500.csv & MON_PID=$!
k6 run concurrency_test.js -e N=5000 -e C=500 --summary-export test_reports/out_c500.json
kill $MON_PID
```

---

## **5. Test Types Explained**

### **Throughput Testing (RPS-based)**

- **Purpose**: Test how many requests per second the server can handle
- **Executor**: `constant-arrival-rate`
- **What it measures**: Server's capacity to process requests at a steady rate
- **Use case**: Production capacity planning, SLA validation

### **Concurrency Testing (VU-based)**

- **Purpose**: Test how the server performs under concurrent user load
- **Executor**: `constant-vus`
- **What it measures**: Response time degradation as concurrent users increase
- **Use case**: User experience validation, performance under load

---

## **6. Dockerization Advice**

- **Not mandatory** for local M1 testing.
- Native runs → better raw performance readings.
- Use Docker **only if**:
  - You want reproducible resource limits per service.
  - You want to mimic production container behavior.
- If containerizing:
  - Use arm64 images.
  - Allocate ~2 cores / 4GB to Docker Desktop.
  - Set per-container CPU/mem limits.

---

## **7. Run Order per Scenario**

### **Throughput Testing:**

1. Start monitoring: `./monitor_docker.sh node-load-testing-app > test_reports/usage_r${C}.csv & MON_PID=$!`
2. Run k6: `k6 run throughput_test.js -e N=5000 -e C=${C} --summary-export test_reports/out_r${C}.json`
3. Stop monitoring: `kill $MON_PID`
4. Repeat for all C values.
5. Extract CSV: `./convert_to_csv.sh throughput`

### **Concurrency Testing:**

1. Start monitoring: `./monitor_docker.sh node-load-testing-app > test_reports/usage_c${C}.csv & MON_PID=$!`
2. Run k6: `k6 run concurrency_test.js -e N=5000 -e C=${C} --summary-export test_reports/out_c${C}.json`
3. Stop monitoring: `kill $MON_PID`
4. Repeat for all C values.
5. Extract CSV: `./convert_to_csv.sh concurrency`

---

## **8. Expected Results**

### **Throughput Tests:**

- Will show maximum RPS before errors occur
- Likely breaking point: 1000-1200 RPS
- Measures: Requests per second capacity

### **Concurrency Tests:**

- Will show response time degradation as VUs increase
- Likely breaking point: 800-1000 VUs
- Measures: Response time under concurrent load

### **File Naming Convention:**

- **Throughput**: `out_r{C}.json` and `usage_r{C}.csv`
- **Concurrency**: `out_c{C}.json` and `usage_c{C}.csv`
- **Examples**: `out_r1000.json`, `usage_c500.csv`
