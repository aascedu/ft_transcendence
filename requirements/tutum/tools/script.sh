#!/bin/bash

vault operator init -status

if [ $? -eq 2 ]; then
    echo "..........................Vault not initialized... Initializing now ;).........................."
    vault operator init -n 1 -t 1 | grep 'Token\|Unseal' | awk '{print $4}' > tutum.txt
    echo "..........................Initialization complete!.........................."
    cp tutum.txt /token/tutum.txt
    export VAULT_TOKEN=`cat /token/tutum.txt | tail -n 1`
    KEY=`cat /token/tutum.txt | head -n 1`
    vault operator unseal $KEY
    vault secrets enable -path=secret kv-v2
else
    KEY=`cat /token/tutum.txt | head -n 1`
    vault operator unseal $KEY
fi
