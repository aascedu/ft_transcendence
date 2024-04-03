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
    vault policy write petrus /petrus-policy.hcl

    # Create and write in .py file the token for petrus and in .txt for other containers
    mkdir -p tokens/petrus
    echo -n 'vault_token = "' >> /tokens/petrus/petrus-token.py
    vault token create -policy=petrus | grep 'token' | awk '{print $2}' | head -n 1 | tr -d '\n' >> /tokens/petrus/petrus-token.py
    echo -n '"' >> /tokens/petrus/petrus-token.py
    vault token create -policy=env | grep 'token' | awk '{print $2}' | head -n 1 > /tokens/env-token.txt

    # Enable secret Key/Value Engine and add some secrets at init
    vault secrets enable -path=secret kv-v2
    vault kv put -mount=secret env KPW=$KIBANA_PASSWORD EPW=$ELASTIC_PASSWORD API=cle_api
    priv=`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`
    vault kv put -mount=secret env private_key="$priv"
    pub=$(echo "$priv" | openssl rsa -pubout -outform PEM -in /dev/stdin)
    vault kv put -mount=secret env public_key="$pub"
else
    KEY=`cat /tokens/tutum.txt | head -n 1`
    vault operator unseal $KEY
fi
