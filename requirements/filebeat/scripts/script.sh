#!/bin/bash

# Load the Filebeat index template
filebeat setup --template \
  -E output.logstash.enabled=false \
  -E output.elasticsearch.hosts=["$ELASTICSEARCH_HOSTS"] \
  -E setup.kibana.host=$KIBANA_HOSTS \
  -E setup.template.overwrite=true \
  -E setup.template.settings.index.number_of_replicas=1

# Load the Filebeat dashboards
filebeat setup --dashboards \
  -E output.logstash.enabled=false \
  -E output.elasticsearch.hosts=["$ELASTICSEARCH_HOSTS"] \
  -E setup.kibana.host=$KIBANA_HOSTS
