#! /bin/bash

PROXY_CONF=$(cat .env | grep 'PROXY_CONF' | awk -F '=' '{print $2}')

if [ "$PROXY_CONF" = "proxy.conf" ]; then
    DOCKER_FILE="docker-compose.yml"
    sysctl -w vm.max_map_count=262144
else
    DOCKER_FILE="docker-compose-nologs.yml"
fi

while true; do
    launched=$(docker exec -it tutum cat /state.txt)
    if [ "$launched" = "ready" ]; then
        echo "tutum launched"
        break
    else
        echo "waiting for tutum to launch"
        sleep 1
    fi
done

export ELASTIC_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=EPW env/epw' | tr -cd '[:alnum:]_-')"
export KIBANA_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=EPW env/epw' | tr -cd '[:alnum:]_-')"
export POSTGRES_ALFRED_DB="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=db alfred/db/db' | tr -cd '[:alnum:]_-')"
export POSTGRES_ALFRED_USER="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=user alfred/db/user' | tr -cd '[:alnum:]_-')"
export POSTGRES_ALFRED_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=password alfred/db/password' | tr -cd '[:alnum:]_-')"
export POSTGRES_MNEMOSINE_DB="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=db mnemosine/db/db' | tr -cd '[:alnum:]_-')"
export POSTGRES_MNEMOSINE_USER="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=user mnemosine/db/user' | tr -cd '[:alnum:]_-')"
export POSTGRES_MNEMOSINE_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=password mnemosine/db/password' | tr -cd '[:alnum:]_-')"
export POSTGRES_PETRUS_DB="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=db petrus/db/db' | tr -cd '[:alnum:]_-')"
export POSTGRES_PETRUS_USER="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=user petrus/db/user' | tr -cd '[:alnum:]_-')"
export POSTGRES_PETRUS_PASSWORD="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=password petrus/db/password' | tr -cd '[:alnum:]_-')"
export GOOGLE_PASS="$(docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/env/env-token.txt) && vault kv get -mount=secret -format=json -field=googlepass env/googlepass' | tr -cd '[:alnum:]_-')"
docker compose -f $DOCKER_FILE --env-file .env up --build --remove-orphans
