#! /bin/bash

alertmanager --config.file=/alertmanager/alertmanager.yml --web.listen-address=0.0.0.0:9093 --web.external-url=https://localhost:8000/smtp/ --web.route-prefix=/ 