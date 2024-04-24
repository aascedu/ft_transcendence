FROM    debian:bookworm

RUN     apt update -y && \
        apt upgrade -y && \
        apt install wget -y && \
        mkdir /opt/postgres_exporter && \
        cd /opt/postgres_exporter && \
        wget https://github.com/wrouesnel/postgres_exporter/releases/download/v0.5.1/postgres_exporter_v0.5.1_linux-amd64.tar.gz && \
        tar -xzvf postgres_exporter_v0.5.1_linux-amd64.tar.gz && \
        cd postgres_exporter_v0.5.1_linux-amd64 && \
        cp postgres_exporter /usr/local/bin

COPY        tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT  ["sh", "/entrypoint.sh"]