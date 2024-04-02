#!/bin/bash

vault operator init -status

if [ $? -eq 2 ]; then
    echo "..........................Vault not initialized... Initializing now ;).........................."
    vault operator init | grep 'Token' | awk '{print $4}' > tutum.txt
    echo "..........................Initialization complete!.........................."
    cp tutum.txt /token/tutum.txt
fi