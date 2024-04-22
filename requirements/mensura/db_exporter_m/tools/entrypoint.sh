#! /bin/bash

#sleep 1000
DATA_SOURCE_NAME="postgresql://prom:prom1@mnemosine_db:5432/memory_management?sslmode=disable" postgres_exporter --web.listen-address=:9187 --web.telemetry-path=/metrics