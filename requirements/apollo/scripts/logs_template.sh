curl -X PUT -u elastic:elastic123 "https://localhost:9200/_index_template/my_policy_template?pretty" -H 'Content-Type: application/json' --cacert config/certs/ca/ca.crt -d '
{
  "index_patterns": ["my_policy_index-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "my_policy",
      "index.lifecycle.rollover_alias": "my_policy_index"
    },
    "mappings": {
      "properties": {
        "name": {
          "type": "keyword",
          "index": true
        },
        "data": {
          "type": "boolean"
        },
        "timestamp": {
          "type": "date",
          "format": "epoch_millis"
        }
      }
    }
  }
}'
