#!/bin/bash

sleep 5

vault operator init -status

if [ $? -eq 2 ]; then
    vault operator init -n 1 -t 1 | grep 'Token\|Unseal' | awk '{print $4}' > tutum.txt
    mv tutum.txt /tokens/tutum.txt
    export VAULT_TOKEN=`cat /tokens/tutum.txt | tail -n 1`
    KEY=`cat /tokens/tutum.txt | head -n 1`

    vault operator unseal $KEY
    vault secrets enable -path=secret kv-v2

    # GENERATE PUB/PRIV KEY
    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
    priv=$(cat /private_key.pem)
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    pub=$(cat /public_key.pem)

    vault kv put -mount=secret shared/priv private_key="$priv"
    vault kv put -mount=secret shared/pub public_key="$pub"

    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
    refresh_priv=$(cat /private_key.pem)
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    refresh_pub=$(cat /public_key.pem)

    vault kv put -mount=secret shared/refresh_priv private_key="$refresh_priv"
    vault kv put -mount=secret shared/refresh_pub public_key="$refresh_pub"

    # ALFRED DB
    mkdir -p tokens/alfred-db
    vault policy write alfred-db /alfred-db-policy.hcl
    vault token create -policy=alfred-db | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/alfred-db/alfred-token.txt
    vault kv put -mount=secret alfred/alfred_db db=$ALFRED_DB
    vault kv put -mount=secret alfred/alfred_user user=$ALFRED_USER
    vault kv put -mount=secret alfred/alfred_password password=$ALFRED_PASSWORD

    # ALFRED DJANGO
    mkdir -p tokens/alfred
    vault policy write alfred /alfred-policy.hcl
    echo -n 'vault_token = "' >> /tokens/alfred/token.py
    vault token create -policy=alfred | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/alfred/token.py
    echo -n '"' >> /tokens/alfred/token.py

    # MNEMOSINE DB
    mkdir -p tokens/mnemosine-db
    vault policy write mnemosine-db /mnemosine-db-policy.hcl
    vault token create -policy=mnemosine-db | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/mnemosine-db/mnemosine-token.txt
    vault kv put -mount=secret mnemosine/mnemosine_db db=$MNEMOSINE_DB
    vault kv put -mount=secret mnemosine/mnemosine_user user=$MNEMOSINE_USER
    vault kv put -mount=secret mnemosine/mnemosine_password password=$MNEMOSINE_PASSWORD

    # MNEMOSINE DJANGO
    mkdir -p tokens/mnemosine
    vault policy write mnemosine /mnemosine-policy.hcl
    echo -n 'vault_token = "' >> /tokens/mnemosine/token.py
    vault token create -policy=mnemosine | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/mnemosine/token.py
    echo -n '"' >> /tokens/mnemosine/token.py

    # PETRUS DB
    mkdir -p tokens/petrus-db
    vault policy write petrus-db /petrus-db-policy.hcl
    vault token create -policy=petrus-db | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/petrus-db/petrus-token.txt
    vault kv put -mount=secret petrus/petrus_db db=$PETRUS_DB
    vault kv put -mount=secret petrus/petrus_user user=$PETRUS_USER
    vault kv put -mount=secret petrus/petrus_password password=$PETRUS_PASSWORD

    # PETRUS DJANGO
    mkdir -p tokens/petrus
    vault policy write petrus /petrus-policy.hcl
    echo -n 'vault_token = "' >> /tokens/petrus/token.py
    vault token create -policy=petrus | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/petrus/token.py
    echo -n '"' >> /tokens/petrus/token.py

    # NO DB DJANGO
    mkdir -p tokens/shared-django
    vault policy write shared-django /shared-django-policy.hcl
    echo -n 'vault_token = "' >> /tokens/shared-django/token.py
    vault token create -policy=shared-django | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/shared-django/token.py
    echo -n '"' >> /tokens/shared-django/token.py

    # DAVINCI
    mkdir -p tokens/davinci
    vault policy write davinci /davinci-policy.hcl
    vault token create -policy=davinci | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/davinci/davinci-token.txt
    vault kv put -mount=secret env/gpw GPW=$GRAFANA_PASSWD

    # LOGSTASH
    mkdir -p tokens/elk
    vault policy write elk /elk-policy.hcl
    vault token create -policy=elk | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/elk/elk-token.txt
    vault kv put -mount=secret env/epw EPW=$ELASTIC_PASSWORD1
    vault kv put -mount=secret env/kpw KPW=$KIBANA_PASSWORD1

else
    KEY=`cat /tokens/tutum.txt | head -n 1`
    vault operator unseal $KEY
fi
