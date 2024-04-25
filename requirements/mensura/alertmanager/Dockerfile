FROM        debian:bookworm

RUN         apt update -y && \
            apt upgrade -y && \
            apt install -y wget && \
            wget "https://github.com/prometheus/alertmanager/releases/download/v0.27.0/alertmanager-0.27.0.linux-amd64.tar.gz" && \
            tar -xvf alertmanager-0.27.0.linux-amd64.tar.gz && \
            rm -rf alertmanager-0.27.0.linux-amd64.tar.gz && \
            mv alertmanager-0.27.0.linux-amd64 alertmanager && \
            cp /alertmanager/alertmanager /usr/bin/alertmanager

COPY        conf/alertmanager.yml /alertmanager/alertmanager.yml
COPY        tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT  ["sh", "entrypoint.sh"]