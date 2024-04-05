#! /bin/bash
TOKEN=$(cat /tokens/env-token.txt)
export GRAFANA_PASSWD=$(curl --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/env/gpw | jq -r '.data.data.GPW')
grafana-server --config=/etc/grafana/grafana.ini --homepath=/usr/share/grafana/
