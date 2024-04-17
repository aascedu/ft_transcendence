#! /bin/bash

docker compose up -d tutum

# Wait for tutum to init all good
sleep 10
docker exec -it tutum sh -c 'export VAULT_TOKEN=$(cat /tokens/aether/aether-token.txt) && vault kv get -mount=secret -format=json -field=EPW env/epw' > buff.txt
p2=$(cat buff.txt | tr -cd '[:alnum:]_-')
rm buff.txt
export ELASTIC_PASSWORD="abc$p2"

# Launch the rest of the project
docker compose -f docker-compose.yml --env-file .env up --build