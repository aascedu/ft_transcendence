#!/bin/bash
COLOR_RED='\e[1;31m'
COLOR_GREEN='\e[1;32m'
COLOR_BLUE='\e[1;34m'
COLOR_RESET='\e[0m'


if [ x${ELASTIC_HOSTS} == x ]; then
  echo "${COLOR_GREEN}Set the ELASTIC_HOSTS environment variable in the .env file${COLOR_RESET}";
  exit 1;
elif [ x${KIBANA_HOSTS} == x ]; then
  echo "${COLOR_GREEN}Set the KIBANA_HOSTS environment variable in the .env file${COLOR_RESET}";
  exit 1;
fi;

# Load the Filebeat index template
filebeat setup --template \
  -E output.logstash.enabled=false \
  -E output.elasticsearch.hosts=["$ELASTICSEARCH_HOSTS"] \
  -E setup.kibana.host=$KIBANA_HOSTS \
  -E setup.template.overwrite=true \
  -E setup.template.settings.index.number_of_replicas=0

# Load the Filebeat dashboards
filebeat setup --dashboards \
  -E output.logstash.enabled=false \
  -E output.elasticsearch.hosts=["$ELASTICSEARCH_HOSTS"] \
  -E setup.kibana.host=$KIBANA_HOSTS