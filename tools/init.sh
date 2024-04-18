#! /bin/bash

#docker compose up -d tutum

sleep 10

export ELASTIC_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/elk/elk-token.txt) && vault kv get -mount=secret -format=json -field=EPW env/epw' | tr -cd '[:alnum:]_-')"
export KIBANA_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/elk/elk-token.txt) && vault kv get -mount=secret -format=json -field=KPW env/kpw' | tr -cd '[:alnum:]_-')"
export | grep 'ELASTIC'
export | grep 'KIBANA'
docker compose -f docker-compose.yml --env-file .env up --build