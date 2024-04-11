FROM        debian:bookworm

ENV         VAULT_ADDR=http://0.0.0.0:8200/
ARG         ELASTIC_PASSWORD
ARG         KIBANA_PASSWORD
ARG         GRAFANA_PASSWD

RUN         export ELASTIC_PASSWORD=ELASTIC_PASSWORD && \
            export KIBANA_PASSWORD=KIBANA_PASSWORD && \
            export GRAFANA_PASSWD=GRAFANA_PASSWD

COPY        conf/config.hcl /config.hcl
COPY        conf/env-policy.hcl /env-policy.hcl
COPY        conf/shared-policy.hcl /shared-policy.hcl
COPY        conf/petrus-policy.hcl /petrus-policy.hcl

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

