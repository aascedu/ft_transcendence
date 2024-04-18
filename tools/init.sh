#! /bin/bash

sleep 10

export ELASTIC_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=EPW env/epw' | tr -cd '[:alnum:]_-')"
export KIBANA_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=KPW env/kpw' | tr -cd '[:alnum:]_-')"
export POSTGRES_ALFRED_DB="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=db alfred/db/db' | tr -cd '[:alnum:]_-')"
export POSTGRES_ALFRED_USER="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=user alfred/db/user' | tr -cd '[:alnum:]_-')"
export POSTGRES_ALFRED_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=password alfred/db/password' | tr -cd '[:alnum:]_-')"
export POSTGRES_MNEMOSINE_DB="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=db mnemosine/db/db' | tr -cd '[:alnum:]_-')"
export POSTGRES_MNEMOSINE_USER="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=user mnemosine/db/user' | tr -cd '[:alnum:]_-')"
export POSTGRES_MNEMOSINE_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=password mnemosine/db/password' | tr -cd '[:alnum:]_-')"
export POSTGRES_PETRUS_DB="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=db petrus/db/db' | tr -cd '[:alnum:]_-')"
export POSTGRES_PETRUS_USER="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=user petrus/db/user' | tr -cd '[:alnum:]_-')"
export POSTGRES_PETRUS_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=password petrus/db/password' | tr -cd '[:alnum:]_-')"
docker compose -f docker-compose.yml --env-file .env up --build