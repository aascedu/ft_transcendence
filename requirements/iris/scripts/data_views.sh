#!/bin/bash
COLOR_GREEN='\e[1;32m'
COLOR_RED='\e[1;31m'
COLOR_RESET='\e[0m'

# Define the URL for Elasticsearch
KIBANA_URL="localhost:5601"

# Define the path to the CA certificate
CA_CERT="/usr/share/kibana/config/certs/ca/ca.crt"

set -e

if [ x${ELASTIC_USER} == x ]; then
  echo "${COLOR_RED}Set the ELASTIC_USER environment variable in the .env file${COLOR_RESET}";
  exit 1;
elif [ x${ELASTIC_PASSWORD} == x ]; then
  echo "${COLOR_RED}Set the ELASTIC_PASSWORD environment variable in the .env file${COLOR_RESET}";
  exit 1;
fi;


response=$(curl -X GET "$KIBANA_URL/api/data_views" \
            -u ${ELASTIC_USER}:${ELASTIC_PASSWORD}  \
            --cacert "$CA_CERT"                     \
            -H 'kbn-xsrf: true')
if [[ "$response" == *"filebeat-index-*"* ]] && \
  [[ "$response" == *"logstash-index-*"* ]] && \
  [[ "$response" == *"nginx-index-*"* ]]; then
  echo -e "${COLOR_GREEN}All Data Views creation completed.${COLOR_RESET}"
else
  echo -e "${COLOR_GREEN}Creating Data Views...${COLOR_RESET}"

  curl -X POST "$KIBANA_URL/api/data_views/data_view" \
  -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
  --cacert "$CA_CERT" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d'
  {
    "data_view": {
      "title": "nginx-index-*",
      "name": "My Nginx Data View"
    }
  }
  '

  curl -X POST "$KIBANA_URL/api/data_views/data_view" \
  -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
  --cacert "$CA_CERT" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d'
  {
    "data_view": {
      "title": "logstash-index-*",
      "name": "My Logstash Data View"
    }
  }
  '

  curl -X POST "$KIBANA_URL/api/data_views/data_view" \
  -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
  --cacert "$CA_CERT" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d'
  {
    "data_view": {
      "title": "filebeat-index-*",
      "name": "My Filebeat Data View"
    }
  }
  '
fi

# Creating Data Views
response=$(curl -X GET "$KIBANA_URL/api/data_views" \
            -u ${ELASTIC_USER}:${ELASTIC_PASSWORD}  \
            --cacert "$CA_CERT"                     \
            -H 'kbn-xsrf: true')

if [[ "$response" == *"filebeat-index-*"* ]] && \
  [[ "$response" == *"logstash-index-*"* ]] && \
  [[ "$response" == *"nginx-index-*"* ]]; then
  echo -e "${COLOR_GREEN}All Data Views creation completed.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}Issue with Data Views creation.${COLOR_RESET}"
  exit 1;
fi

sleep 10
