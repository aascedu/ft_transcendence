FROM        debian:bookworm

RUN         apt update -y && \
            apt upgrade -y && \
            apt install -y  apt-transport-https \
                            software-properties-common \
                            curl \
                            jq \
                            wget && \
            apt-get install -y adduser libfontconfig1 musl && \
            wget https://dl.grafana.com/enterprise/release/grafana-enterprise_10.4.0_amd64.deb && \
            dpkg -i grafana-enterprise_10.4.0_amd64.deb

COPY        conf/grafana.ini /etc/grafana/grafana.ini
COPY        tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT  ["sh", "/entrypoint.sh"]
