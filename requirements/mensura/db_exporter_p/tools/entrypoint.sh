#! /bin/bash

#sleep 1000
DATA_SOURCE_NAME="postgresql://prom:prom1@petrus_db:5432/auth_management?sslmode=disable" postgres_exporter --web.listen-address=:9187 --web.telemetry-path=/metrics