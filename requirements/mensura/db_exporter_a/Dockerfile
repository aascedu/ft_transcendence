FROM    debian:bookworm

RUN     apt-get update -y && \
        apt-get upgrade -y && \
        apt-get install wget curl jq -y && \
        mkdir /opt/postgres_exporter && \
        cd /opt/postgres_exporter && \
        wget https://github.com/prometheus-community/postgres_exporter/releases/download/v0.15.0/postgres_exporter-0.15.0.linux-amd64.tar.gz && \
        tar -xzvf postgres_exporter-0.15.0.linux-amd64.tar.gz && \
        cd postgres_exporter-0.15.0.linux-amd64 && \
        cp postgres_exporter /usr/local/bin

COPY        tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT  ["sh", "/entrypoint.sh"]