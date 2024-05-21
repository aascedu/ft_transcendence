#!/bin/bash

COLOR_RED='\e[1;31m'
COLOR_GREEN='\e[1;32m'
COLOR_BLUE='\e[1;34m'
COLOR_RESET='\e[0m'

# for container in "$@"
# do
#      echo -e "${COLOR_BLUE}Copying shared_code : ${COLOR_RESET}$container"
#      cp -r ./requirements/shared_code/ ./requirements/$container/${container}_project/shared/
#      cp -r ./requirements/shared_code/* ./requirements/$container/${container}_project/shared/
#      cp ./requirements/shared_code/test_settings.py ./requirements/$container/${container}_project/${container}_project/
# done
echo -e "${COLOR_BLUE}Copying shared_code : alfred${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/user/alfred/alfred_project/shared/
cp -r ./requirements/shared_code/* ./requirements/user/alfred/alfred_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/user/alfred/alfred_project/alfred_project/
echo -e -n "\n"
echo -e "${COLOR_BLUE}Copying shared_code : coubertin${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/game/coubertin/coubertin_project/shared/
cp -r ./requirements/shared_code/* ./requirements/game/coubertin/coubertin_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/game/coubertin/coubertin_project/coubertin_project/
echo -e -n "\n"
echo -e "${COLOR_BLUE}Copying shared_code : cupidon${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/game/cupidon/cupidon_project/shared/
cp -r ./requirements/shared_code/* ./requirements/game/cupidon/cupidon_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/game/cupidon/cupidon_project/cupidon_project/
echo -e -n "\n"
echo -e "${COLOR_BLUE}Copying shared_code : hermes${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/events_stats/hermes/hermes_project/shared/
cp -r ./requirements/shared_code/* ./requirements/events_stats/hermes/hermes_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/events_stats/hermes/hermes_project/hermes_project/
echo -e -n "\n"
echo -e "${COLOR_BLUE}Copying shared_code : ludo${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/game/ludo/ludo_project/shared/
cp -r ./requirements/shared_code/* ./requirements/game/ludo/ludo_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/game/ludo/ludo_project/ludo_project/
echo -e -n "\n"
echo -e "${COLOR_BLUE}Copying shared_code : mnemosine${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/events_stats/mnemosine/mnemosine_project/shared/
cp -r ./requirements/shared_code/* ./requirements/events_stats/mnemosine/mnemosine_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/events_stats/mnemosine/mnemosine_project/mnemosine_project/
echo -e -n "\n"
echo -e "${COLOR_BLUE}Copying shared_code : petrus${COLOR_RESET}"
cp -r ./requirements/shared_code/ ./requirements/user/petrus/petrus_project/shared/
cp -r ./requirements/shared_code/* ./requirements/user/petrus/petrus_project/shared/
cp ./requirements/shared_code/test_settings.py ./requirements/user/petrus/petrus_project/petrus_project/
echo -e -n "\n"
# for container in "$@"
# do
     # echo -e "${COLOR_RED}Executing migrations for : ${COLOR_RESET}$container"
     # python3 ./requirements/$container/*/manage.py makemigrations
     # python3 ./requirements/$container/*/manage.py migrate
     # echo -e -n "\n"
# done
#
 # python3 ./requirements/mnemosine/*/manage.py makemigrations memory
 # python3 ./requirements/petrus/*/manage.py makemigrations signin
 # python3 ./requirements/alfred/*/manage.py makemigrations user_management
 # python3 ./requirements/mnemosine/*/manage.py migrate
 # python3 ./requirements/petrus/*/manage.py migrate
 # python3 ./requirements/alfred/*/manage.py migrate
