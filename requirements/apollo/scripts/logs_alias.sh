curl -X PUT -u elastic:elastic123 "https://localhost:9200/%3Cmy_policy_index-%7Bnow%2Fd%7BYYYYMMdd%7D%7D-1%3E?pretty" -H 'Content-Type: application/json' --cacert config/certs/ca/ca.crt -d '
{
  "aliases": {
    "my_policy_index": {
      "is_write_index": true
    }
  }
}'
