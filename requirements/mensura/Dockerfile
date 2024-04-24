FROM        debian:bookworm

RUN         apt update -y && \
            apt upgrade -y && \
            apt install -y prometheus

COPY        conf/prometheus.yml /etc/prometheus/prometheus.yml
COPY        conf/alert.rules.yml /etc/prometheus/alert.rules.yml
COPY        tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT  ["sh", "entrypoint.sh"]
