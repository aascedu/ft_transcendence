#! /bin/bash
TOKEN=$(cat /tokens/alertmanager-token.txt)
export GOOGLE_PASS=$(curl -s --header "X-Vault-Token: $TOKEN" http://tutum:8200/v1/secret/data/env/googlepass | jq -r '.data.data.googlepass')
cat /alertmanager/alertmanager1.yml > /alertmanager/alertmanager.yml
echo -n $GOOGLE_PASS >> /alertmanager/alertmanager.yml
cat /alertmanager/alertmanager2.yml >> /alertmanager/alertmanager.yml
alertmanager --config.file=/alertmanager/alertmanager.yml --web.listen-address=0.0.0.0:9093 --web.external-url=https://localhost:8000/smtp/ --web.route-prefix=/