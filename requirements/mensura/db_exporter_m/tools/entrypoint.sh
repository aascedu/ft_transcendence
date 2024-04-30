#! /bin/bash
TOKEN=$(cat /tokens/db_exporter-token.txt)
export PROM_PASSWD=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/env/pg_monitor | jq -r '.data.data.pg_monitor')
echo m $PROM_PASSWD
DATA_SOURCE_NAME="postgresql://prom:prom1@mnemosine_db:5432/memory_management?sslmode=disable" postgres_exporter --web.listen-address=:9187 --web.telemetry-path=/metrics --collector.database