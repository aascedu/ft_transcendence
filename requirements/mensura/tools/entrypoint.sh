#! /bin/bash

prometheus --config.file=/etc/prometheus/prometheus.yml --web.listen-address=0.0.0.0:8011 --web.external-url=https://localhost:8000/mensura/ --web.route-prefix=/