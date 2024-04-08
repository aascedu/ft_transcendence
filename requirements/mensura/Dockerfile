FROM        debian:bookworm

RUN         apt update -y && \
            apt upgrade -y && \
            apt install -y prometheus wget

RUN         mkdir /alertmanager && \
            cd /alertmanager && \
            wget "https://github.com/prometheus/alertmanager/releases/download/v0.27.0/alertmanager-0.27.0.linux-amd64.tar.gz" && \
            tar -xvf alertmanager-0.27.0.linux-amd64.tar.gz && \
            rm -rf alertmanager-0.27.0.linux-amd64.tar.gz

COPY        conf/prometheus.yml /etc/prometheus/prometheus.yml
COPY        conf/alert.rules.yml /etc/prometheus/alert.rules.yml
COPY        conf/alertmanager.yml /alertmanager/alertmanager-0.27.0.linux-amd64/alertmanager.yml
COPY        tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT  ["sh", "entrypoint.sh"]
