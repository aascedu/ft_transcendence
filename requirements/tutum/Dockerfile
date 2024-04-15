FROM        debian:bookworm

ENV         VAULT_ADDR=http://0.0.0.0:8200/
ARG         ELASTIC_PASSWORD
ARG         KIBANA_PASSWORD
ARG         GRAFANA_PASSWD
ARG         ALFRED_DB
ARG         ALFRED_USER
ARG         ALFRED_PASSWORD
ARG         MNEMOSINE_DB
ARG         MNEMOSINE_USER
ARG         MNEMOSINE_PASSWORD
ARG         PETRUS_DB
ARG         PETRUS_USER
ARG         PETRUS_PASSWORD

RUN         export ELASTIC_PASSWORD=ELASTIC_PASSWORD && \
            export KIBANA_PASSWORD=KIBANA_PASSWORD && \
            export GRAFANA_PASSWD=GRAFANA_PASSWD && \
            export ALFRED_DB=ALFRED_DB && \
            export ALFRED_USER=ALFRED_USER && \
            export ALFRED_PASSWORD=ALFRED_PASSWORD && \
            export MNEMOSINE_DB=MNEMOSINE_DB && \
            export MNEMOSINE_USER=MNEMOSINE_USER && \
            export MNEMOSINE_PASSWORD=MNEMOSINE_PASSWORD && \
            export PETRUS_DB=PETRUS_DB && \
            export PETRUS_USER=PETRUS_USER && \
            export PETRUS_PASSWORD=PETRUS_PASSWORD

COPY        conf/ /

RUN         apt update -y && \
            apt upgrade -y && \
            apt install -y gpg wget lsb-release curl openssh-client && \
            wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
            gpg --no-default-keyring --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg --fingerprint && \
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
            apt update -y && \
            apt install -y vault

COPY        ./tools/script.sh /script.sh
RUN         chmod +x /script.sh

CMD         ./script.sh & \
            vault server -config=config.hcl

