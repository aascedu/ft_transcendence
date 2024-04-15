#!/bin/bash

sleep 5

vault operator init -status

if [ $? -eq 2 ]; then
    vault operator init -n 1 -t 1 | grep 'Token\|Unseal' | awk '{print $4}' > tutum.txt
    mv tutum.txt /tokens/tutum.txt
    export VAULT_TOKEN=`cat /tokens/tutum.txt | tail -n 1`
    KEY=`cat /tokens/tutum.txt | head -n 1`
    vault operator unseal $KEY

    # Create policy for tokens to be created on
    vault policy write env /env-policy.hcl
    mkdir -p tokens/petrus
    vault policy write petrus /petrus-policy.hcl
    mkdir -p tokens/shared
    vault policy write shared /shared-policy.hcl

    # Create and write in .py file the token for shared and in .txt for other containers
    mkdir -p tokens/davinci
    echo -n 'vault_token = "' >> /tokens/shared/token.py
    vault token create -policy=shared | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/shared/token.py
    echo -n '"' >> /tokens/shared/token.py
    echo -n 'vault_token = "' >> /tokens/petrus/token.py
    vault token create -policy=petrus | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/petrus/token.py
    echo -n '"' >> /tokens/petrus/token.py
    vault token create -policy=env | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/env-token.txt
    cp /tokens/env-token.txt /tokens/davinci/env-token.txt

    # Enable secret Key/Value Engine and add some secrets at init
    vault secrets enable -path=secret kv-v2
    vault kv put -mount=secret env/kpw KPW=$KIBANA_PASSWORD
    vault kv put -mount=secret env/epw EPW=$ELASTIC_PASSWORD
    vault kv put -mount=secret env/gpw GPW=$GRAFANA_PASSWD

    mkdir /key
    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
    priv=$(cat /private_key.pem)
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    pub=$(cat /public_key.pem)

    vault kv put -mount=secret shared/priv private_key="$priv"
    vault kv put -mount=secret shared/pub public_key="$pub"

    # ALFRED DB
    mkdir -p tokens/alfred-db
    vault policy write alfred-db /alfred-db-policy.hcl
    vault token create -policy=alfred-db | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/alfred-db/alfred-token.txt
    vault kv put -mount=secret alfred/db/alfred_db db=$ALFRED_DB
    vault kv put -mount=secret alfred/db/alfred_user user=$ALFRED_USER
    vault kv put -mount=secret alfred/db/alfred_password password=$ALFRED_PASSWORD

    # MNEMOSINE DB
    mkdir -p tokens/mnemosine-db
    vault policy write mnemosine-db /mnemosine-db-policy.hcl
    vault token create -policy=mnemosine-db | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/mnemosine-db/mnemosine-token.txt
    vault kv put -mount=secret mnemosine/db/mnemosine_db db=$MNEMOSINE_DB
    vault kv put -mount=secret mnemosine/db/mnemosine_user user=$MNEMOSINE_USER
    vault kv put -mount=secret mnemosine/db/mnemosine_password password=$MNEMOSINE_PASSWORD

    # PETRUS DB
    mkdir -p tokens/petrus-db
    vault policy write petrus-db /petrus-db-policy.hcl
    vault token create -policy=petrus-db | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/petrus-db/petrus-token.txt
    vault kv put -mount=secret petrus/db/petrus_db db=$PETRUS_DB
    vault kv put -mount=secret petrus/db/petrus_user user=$PETRUS_USER
    vault kv put -mount=secret petrus/db/petrus_password password=$PETRUS_PASSWORD
else
    KEY=`cat /tokens/tutum.txt | head -n 1`
    vault operator unseal $KEY
fi
