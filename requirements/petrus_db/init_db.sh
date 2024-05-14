#! /bin/bash

TOKEN=$(cat /tokens/petrus-token.txt)
export PETRUS_DB=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/petrus/petrus_db | jq -r '.data.data.db')
export PETRUS_USER=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/petrus/petrus_user | jq -r '.data.data.user')
export PETRUS_PASSWORD=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/petrus/petrus_password | jq -r '.data.data.password')
export PROM_PASS=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/env/pg_monitor | jq -r '.data.data.pg_monitor')

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $PETRUS_USER WITH PASSWORD '$PETRUS_PASSWORD';
CREATE DATABASE $PETRUS_DB;
GRANT ALL PRIVILEGES ON DATABASE $PETRUS_DB TO $PETRUS_USER;
CREATE USER prom WITH PASSWORD '$PROM_PASS';
GRANT pg_monitor TO prom;
EOSQL
