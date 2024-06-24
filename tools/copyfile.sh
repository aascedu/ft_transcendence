#!/bin/bash

COLOR_RED='\e[1;31m'
COLOR_GREEN='\e[1;32m'
COLOR_BLUE='\e[1;34m'
COLOR_RESET='\e[0m'

for container in "$@"
do
     echo -e "${COLOR_BLUE}Copying shared_code : ${COLOR_RESET}$container"
     cp -r ./requirements/shared_code/ ./requirements/$container/${container}_project/shared/
     cp -r ./requirements/shared_code/* ./requirements/$container/${container}_project/shared/
done

echo -e -n "\n"
