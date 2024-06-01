curl -X PUT -u elastic:elastic123 "https://localhost:9200/_index_template/timeseries_template?pretty" -H 'Content-Type: application/json' --cacert config/certs/ca/ca.crt -d '
{
  "index_patterns": ["timeseries-*"],
  "data_stream": { },
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "timeseries_policy",
      "index.lifecycle.rollover_alias": "test-alias"
    }
  }
}
'