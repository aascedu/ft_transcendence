#!/bin/bash
COLOR_GREEN='\e[1;32m'
COLOR_RESET='\e[0m'

# Define the URL for Elasticsearch
ELASTICSEARCH_URL="https://localhost:9200"

# Define the path to the CA certificate
CA_CERT="/usr/share/elasticsearch/config/certs/ca/ca.crt"

# Function to check Elasticsearch availability
check_elasticsearch() {
    curl --cacert "$CA_CERT" "$ELASTICSEARCH_URL" > /dev/null 2>&1
}

# Wait for Elasticsearch to become available
until check_elasticsearch; do
    echo -e "${COLOR_GREEN}Elasticsearch is not yet available. Waiting...${COLOR_RESET}"
    sleep 10
done

# Once Elasticsearch is available, create the ILM policy
echo -e "${COLOR_GREEN}Elasticsearch is now available. Configuring ILM policy...${COLOR_RESET}"

curl -X PUT -u elastic:elastic123 "$ELASTICSEARCH_URL/_ilm/policy/my_policy?pretty" \
-H 'Content-Type: application/json' \
--cacert "$CA_CERT" \
-d '{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50GB",
            "max_age": "30s"
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "warm": {
        "min_age": "7s",
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          },
          "shrink": {
            "number_of_shards": 1
          },
          "allocate": {
            "require": {
              "data": "warm"
            }
          },
          "set_priority": {
            "priority": 25
          }
        }
      },
      "cold": {
        "min_age": "30s",
        "actions": {
          "set_priority": {
            "priority": 0
          },
          "freeze": {},
          "allocate": {
            "require": {
              "data": "cold"
            }
          }
        }
      },
      "delete": {
        "min_age": "60s",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

echo -e "${COLOR_GREEN}ILM policy configuration completed.${COLOR_RESET}"
