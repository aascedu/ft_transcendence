#!/bin/bash

COLOR_RED='\e[1;31m'
COLOR_GREEN='\e[1;32m'
COLOR_BLUE='\e[1;34m'
COLOR_RESET='\e[0m'

set -e

for django_service in "$@"
do
    echo -e "${COLOR_GREEN}Executing migrations for : ${COLOR_RESET}$django_service"
    python3 ./requirements/$django_service/*/manage.py test
    echo -e -n "\n"
done
