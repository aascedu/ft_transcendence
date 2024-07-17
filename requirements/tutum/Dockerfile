FROM        debian:bookworm

ENV         VAULT_ADDR=http://0.0.0.0:8200/
ARG         ELASTIC_PASSWORD1
ARG         KIBANA_PASSWORD1
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
ARG         T_POSTGRES_ALFRED_DB
ARG         T_POSTGRES_ALFRED_USER
ARG         T_POSTGRES_ALFRED_PASSWORD
ARG         T_POSTGRES_MNEMOSINE_DB
ARG         T_POSTGRES_MNEMOSINE_USER
ARG         T_POSTGRES_MNEMOSINE_PASSWORD
ARG         T_POSTGRES_PETRUS_DB
ARG         T_POSTGRES_PETRUS_USER
ARG         T_POSTGRES_PETRUS_PASSWORD
ARG         GOOGLE_PASS1
ARG         PROM_PASS

RUN         export ELASTIC_PASSWORD1=ELASTIC_PASSWORD1 && \
            export KIBANA_PASSWORD1=KIBANA_PASSWORD1 && \
            export GRAFANA_PASSWD=GRAFANA_PASSWD && \
            export ALFRED_DB=ALFRED_DB && \
            export ALFRED_USER=ALFRED_USER && \
            export ALFRED_PASSWORD=ALFRED_PASSWORD && \
            export MNEMOSINE_DB=MNEMOSINE_DB && \
            export MNEMOSINE_USER=MNEMOSINE_USER && \
            export MNEMOSINE_PASSWORD=MNEMOSINE_PASSWORD && \
            export PETRUS_DB=PETRUS_DB && \
            export PETRUS_USER=PETRUS_USER && \
            export PETRUS_PASSWORD=PETRUS_PASSWORD && \
            export T_POSTGRES_ALFRED_DB=T_POSTGRES_ALFRED_DB && \
            export T_POSTGRES_ALFRED_USER=T_POSTGRES_ALFRED_USER && \
            export T_POSTGRES_ALFRED_PASSWORD=T_POSTGRES_ALFRED_PASSWORD && \
            export T_POSTGRES_MNEMOSINE_DB=T_POSTGRES_MNEMOSINE_DB && \
            export T_POSTGRES_MNEMOSINE_USER=T_POSTGRES_MNEMOSINE_USER && \
            export T_POSTGRES_MNEMOSINE_PASSWORD=T_POSTGRES_MNEMOSINE_PASSWORD && \
            export T_POSTGRES_PETRUS_DB=T_POSTGRES_PETRUS_DB && \
            export T_POSTGRES_PETRUS_USER=T_POSTGRES_PETRUS_USER && \
            export T_POSTGRES_PETRUS_PASSWORD=T_POSTGRES_PETRUS_PASSWORD && \
            export GOOGLE_PASS1=GOOGLE_PASS1 && \
            export PROM_PASS=PROM_PASS

COPY        conf/ /

RUN         apt-get update -y && \
            apt-get upgrade -y && \
            apt-get install -y gpg wget lsb-release curl openssh-client && \
            wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
            gpg --no-default-keyring --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg --fingerprint && \
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
            apt-get update -y && \
            apt-get install -y vault

COPY        ./tools/script.sh /script.sh
RUN         chmod +x /script.sh

CMD         ./script.sh & \
            vault server -config=config.hcl

