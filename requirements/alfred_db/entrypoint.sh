#! /bin/bash

sleep 5

TOKEN=$(cat /tokens/alfred-token.txt)

export POSTGRES_DB=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/db/postgre_db | jq -r '.data.data.db')
export POSTGRES_USER=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/db/postgre_user | jq -r '.data.data.user')
export POSTGRES_PASSWORD=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/db/postgre_password | jq -r '.data.data.password')
export ALFRED_DB=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/db/alfred_db | jq -r '.data.data.db')
export ALFRED_USER=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/db/alfred_user | jq -r '.data.data.user')
export ALFRED_PASSWORD=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/alfred/db/alfred_password | jq -r '.data.data.password')

echo TEST ALFRED DB INSIDE : $POSTGRES_DB $POSTGRES_PASSWORD $POSTGRES_USER

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $ALFRED_USER WITH PASSWORD '$ALFRED_PASSWORD';
CREATE DATABASE $ALFRED_DB;
GRANT ALL PRIVILEGES ON DATABASE $ALFRED_DB TO $ALFRED_USER;
EOSQL