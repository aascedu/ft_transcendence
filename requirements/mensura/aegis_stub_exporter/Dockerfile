FROM    debian:bookworm

RUN     apt update -y && \
        apt upgrade -y && \
        apt install wget -y && \
        wget https://github.com/nginxinc/nginx-prometheus-exporter/releases/download/v1.1.0/nginx-prometheus-exporter_1.1.0_linux_amd64.tar.gz && \
        tar -xvf nginx-prometheus-exporter_1.1.0_linux_amd64.tar.gz && \
        rm nginx-prometheus-exporter_1.1.0_linux_amd64.tar.gz

ENTRYPOINT ["./nginx-prometheus-exporter", "--nginx.scrape-uri=https://aegis/stub_status"]