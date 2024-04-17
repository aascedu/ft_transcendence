#!/bin/bash

COLOR_RED='\e[1;31m'
COLOR_GREEN='\e[1;32m'
COLOR_BLUE='\e[1;34m'
COLOR_RESET='\e[0m'

echo -e "\n\t${COLOR_GREEN}Building ModSecurity...${COLOR_RESET}\n"; \
old_image_id=$(docker images -q modsec)
docker build -t modsec -f ./modsec/Dockerfile .
new_image_id=$(docker images -q modsec); \
if [ "$old_image_id" != "$new_image_id" ]; then \
    echo -e "\n\t${COLOR_GREEN}Cleaning ModSecurity folder in local...${COLOR_RESET}\n"; \
    rm -rf ./requirements/aegis/ModSecurity/; \
    docker rm -f modsec || true; \
    docker run -d --name modsec modsec; \
    docker cp modsec:/ModSecurity ./requirements/aegis/ModSecurity; \
    echo -e "\n\t${COLOR_BLUE}Build & Copy done !${COLOR_RESET}\n"; \
else \
    echo -e "\n\t${COLOR_RED}ModSecurity${COLOR_RESET} image has not changed, ${COLOR_RED}skipping building.${COLOR_RESET}"; \
    if [ ! -d "./requirements/aegis/ModSecurity" ]; then \
        echo -e "\t${COLOR_GREEN}No ModSecurity folder in local, Copying now...${COLOR_RESET}\n"; \
        docker rm -f modsec || true; \
        docker run -d --name modsec modsec; \
        docker cp modsec:/ModSecurity ./requirements/aegis/ModSecurity; \
        echo -e "\t${COLOR_BLUE}Copy done !${COLOR_RESET}\n"; \
    else \
        echo -e "\n\t${COLOR_RED}ModSecurity${COLOR_RESET} folder already here, ${COLOR_RED}no need to copy since image hasn't changed.${COLOR_RESET}\n"; \
    fi \
fi