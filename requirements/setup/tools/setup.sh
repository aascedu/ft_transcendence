#!/bin/bash
COLOR_RED='\e[1;31m'
COLOR_GREEN='\e[1;32m'
COLOR_BLUE='\e[1;34m'
COLOR_RESET='\e[0m'

set -e
echo -e "\n${COLOR_GREEN}-${ELASTIC_PASSWORD}- && -${KIBANA_PASSWORD}-${COLOR_RESET}\n"

if [ x${ELASTIC_PASSWORD} == x ]; then
  echo "${COLOR_GREEN}Set the ELASTIC_PASSWORD environment variable in the .env file${COLOR_RESET}";
  exit 1;
elif [ x${KIBANA_PASSWORD} == x ]; then
  echo "${COLOR_GREEN}Set the KIBANA_PASSWORD environment variable in the .env file${COLOR_RESET}";
  exit 1;
fi;

# Check if the CA certificate exists, create if not
if [ ! -f config/certs/ca.zip ]; then
  echo -e "${COLOR_GREEN}Creating CA${COLOR_RESET}";
  bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
  unzip config/certs/ca.zip -d config/certs;
fi;

# Check if the certificates exist, create if not
if [ ! -f config/certs/certs.zip ]; then
  echo -e "${COLOR_GREEN}Creating certs${COLOR_RESET}";
  echo -ne \
  "instances:\n"\
  "  - name: apollo\n"\
  "    dns:\n"\
  "      - apollo\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  "  - name: aether\n"\
  "    dns:\n"\
  "      - aether\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  "  - name: iris\n"\
  "    dns:\n"\
  "      - iris\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  > config/certs/instances.yml;
  bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
  unzip config/certs/certs.zip -d config/certs;
fi;

# Set file permissions
echo -e "${COLOR_GREEN}Setting file permissions${COLOR_RESET}"
chown -R root:root config/certs;
find . -type d -exec chmod 750 {} \;
find . -type f -exec chmod 640 {} \;

# echo -e "${COLOR_GREEN}Convert the Logstash key to pkcs8${COLOR_RESET}"
# openssl pkcs8 -inform PEM -in config/certs/aether/aether.key -topk8 -nocrypt -outform PEM -out config/certs/aether/aether.pkcs8.key

# Wait for Elasticsearch availability
echo -e "${COLOR_GREEN}Waiting for Elasticsearch availability${COLOR_RESET}";
until curl --cacert config/certs/ca/ca.crt https://apollo:9200 | grep -q "missing authentication credentials"; do sleep 30; done;

# Set kibana_system password
echo -e "${COLOR_GREEN}Setting kibana_system password${COLOR_RESET}";
# until curl -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://apollo:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;
until curl -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://apollo:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;

echo -e "${COLOR_GREEN}All done!${COLOR_RESET}";