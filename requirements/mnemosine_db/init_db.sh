#! /bin/bash
TOKEN=$(cat /tokens/mnemosine-token.txt)
export MNEMOSINE_DB=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/mnemosine/mnemosine_db | jq -r '.data.data.db')
export MNEMOSINE_USER=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/mnemosine/mnemosine_user | jq -r '.data.data.user')
export MNEMOSINE_PASSWORD=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/mnemosine/mnemosine_password | jq -r '.data.data.password')

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $MNEMOSINE_USER WITH PASSWORD '$MNEMOSINE_PASSWORD';
CREATE DATABASE $MNEMOSINE_DB;
GRANT ALL PRIVILEGES ON DATABASE $MNEMOSINE_DB TO $MNEMOSINE_USER;
CREATE USER prom WITH PASSWORD 'prom1';
GRANT pg_monitor TO prom;
EOSQL
