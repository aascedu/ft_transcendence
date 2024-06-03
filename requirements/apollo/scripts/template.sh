curl -X PUT -u elastic:elastic123 "https://localhost:9200/_index_template/my_policy_template?pretty" -H 'Content-Type: application/json' --cacert config/certs/ca/ca.crt -d '
{
  "index_patterns": ["my_policy_index-*"],
  "version": 1,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "my_policy",
      "index.lifecycle.rollover_alias": "my_policy_index"
    },
    "mappings": {
      "dynamic": false,
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "@version": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "date": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "host": {
          "type": "object",
          "properties": {
            "ip": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            }
          }
        },
        "sourceip": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        }
      }
    }
  }
}
'