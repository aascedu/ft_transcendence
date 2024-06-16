#!/bin/bash
COLOR_GREEN='\e[1;32m'
COLOR_RED='\e[1;31m'
COLOR_RESET='\e[0m'

# Define the URL for Elasticsearch
ELASTICSEARCH_URL="https://localhost:9200"

# Define the path to the CA certificate
CA_CERT="/usr/share/elasticsearch/config/certs/ca/ca.crt"

set -e

if [ -z "$ELASTIC_USER" ]; then
  echo -e "${COLOR_RED}Set the ELASTIC_USER environment variable in the .env file${COLOR_RESET}"
  exit 1
elif [ -z "$ELASTIC_PASSWORD" ]; then
  echo -e "${COLOR_RED}Set the ELASTIC_PASSWORD environment variable in the .env file${COLOR_RESET}"
  exit 1
fi

# Create the GeoIP ingest pipeline
echo -e "${COLOR_GREEN}Creating GeoIP ingest pipeline...${COLOR_RESET}"

curl -X PUT "$ELASTICSEARCH_URL/_ingest/pipeline/geoip" \
--cacert "$CA_CERT" \
-u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" \
-H 'Content-Type: application/json' \
-d '{
  "description" : "Add GeoIP Info",
  "processors" : [
    {
      "geoip" : {
        "field" : "client_ip"
      }
    }
  ]
}'

response=$(curl -s -X GET -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" \
          "$ELASTICSEARCH_URL/_ingest/pipeline/geoip" \
          -H 'Content-Type: application/json' \
          --cacert "$CA_CERT")

if [[ "$response" == *"geoip"* ]]; then
  echo -e "${COLOR_GREEN}GeoIP pipeline created successfully.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}Issue with GeoIP pipeline creation.${COLOR_RESET}"
  exit 1
fi
