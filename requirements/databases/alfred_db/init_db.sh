#! /bin/bash

TOKEN=$(cat /tokens/alfred-token.txt)
export ALFRED_DB=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/alfred_db | jq -r '.data.data.db')
export ALFRED_USER=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/alfred_user | jq -r '.data.data.user')
export ALFRED_PASSWORD=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/alfred_password | jq -r '.data.data.password')
export PROM_PASS=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/env/pg_monitor | jq -r '.data.data.pg_monitor')

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $ALFRED_USER WITH PASSWORD '$ALFRED_PASSWORD';
CREATE DATABASE $ALFRED_DB;
GRANT ALL PRIVILEGES ON DATABASE $ALFRED_DB TO $ALFRED_USER;
CREATE USER prom WITH PASSWORD '$PROM_PASS';
GRANT pg_monitor TO prom;
EOSQL