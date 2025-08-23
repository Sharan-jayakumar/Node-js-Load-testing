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
