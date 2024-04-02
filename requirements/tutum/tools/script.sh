#!/bin/bash

vault operator init -status

if [ $? -eq 2 ]; then
    echo "..........................Vault not initialized... Initializing now ;).........................."
    vault operator init | grep 'Unseal\|Token' > secret.txt
    echo "..........................Initialization complete!.........................."
    root_token=$(cat secret.txt | grep 'Token' | awk '{print $3}')
    docker exec -it petrus sh -c "export VAULT_TOKEN=$root_token"
fi