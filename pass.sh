#!/bin/bash

# Define the Colors
COLOR_GREEN='\e[1;32m'
COLOR_RED='\e[1;31m'
COLOR_RESET='\e[0m'

choose() {
  echo ${1:RANDOM%${#1}:1}
}

generate_password() {
  local password="$({
    choose '0123456789'
    choose 'abcdefghijklmnopqrstuvwxyz'
    choose 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for i in $( seq 1 $(( 4 + RANDOM % 8 )) )
    do
      choose '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    done
  } | sort -R | awk '{printf "%s",$1}')"
  echo "$password"
}

password_variables=(
  "ELASTIC_PASSWORD1"
  "KIBANA_PASSWORD1"
  "GRAFANA_PASSWD"
  "PROM_PASS"
  "MNEMOSINE_PASSWORD"
  "ALFRED_PASSWORD"
  "PETRUS_PASSWORD"
  "T_POSTGRES_ALFRED_PASSWORD"
  "T_POSTGRES_MNEMOSINE_PASSWORD"
  "T_POSTGRES_PETRUS_PASSWORD"
)

# Path to the .env file
env_file=".env"

echo -e "${COLOR_RED}#------------------------------------------#${COLOR_RESET}"
echo -e "\t${COLOR_RED}Updating passwords in $env_file${COLOR_RESET}"
echo -e "${COLOR_RED}#------------------------------------------#\n${COLOR_RESET}"

for var in "${password_variables[@]}"; do
  new_password=$(generate_password)
  new_password_escaped=$(printf '%s\n' "$new_password" | sed 's/[\/&]/\\&/g')
  if [[ "$var" == "ALFRED_PASSWORD" || "$var" == "PETRUS_PASSWORD" || "$var" == "MNEMOSINE_PASSWORD" ]]; then
    sed -i "s/^${var}=.*/${var}='${new_password_escaped}'/" "$env_file"
    echo -e "${var} ${COLOR_RED}=${COLOR_RESET} '${new_password}'"
  else
    sed -i "s/^${var}=.*/${var}=${new_password_escaped}/" "$env_file"
    echo -e "${var} ${COLOR_RED}=${COLOR_RESET} ${new_password}"
  fi
done

echo -e "\n${COLOR_RED}Passwords updated successfully in $env_file\n${COLOR_RESET}"
