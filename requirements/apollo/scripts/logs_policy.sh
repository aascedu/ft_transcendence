# J'ai rajoute ca au cas ou je pensais que le probleme venait du healthcheck mais non. Apres je trouvais bete de le delete car c'etait un peu plus propre que juste check si c'est online
# -Arthur

    ## Make a request to Elasticsearch to get its current health status
    #health_response=$(curl -u "elastic:elastic123" --cacert "$CA_CERT" "$ELASTICSEARCH_URL/_cluster/health?pretty" 2>/dev/null)
    #echo $health_response
    ## Extract the value of the "status" field using grep and sed
    #health_status=$(echo "$health_response" | grep -o '"status"\s*:\s*"[^"]*"' | sed 's/"status"\s*:\s*"\([^"]*\)"/\1/')
    #echo $health_status
    ## Check if the health status is GREEN
    #if [[ "$health_status" == "green" ]]; then
    #    return 0  # Elasticsearch is available and healthy
    #else
    #    return 1  # Elasticsearch is not yet available or not healthy
    #fi

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
    sleep 1
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
            "max_age": "30d"
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "warm": {
        "min_age": "7d",
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
        "min_age": "30d",
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
        "min_age": "60d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

echo -e "${COLOR_GREEN}ILM policy configuration completed.${COLOR_RESET}"

sleep 10