FROM        debian:bookworm

ENV VAULT_ADDR=http://0.0.0.0:8200/

COPY        conf/config.hcl /config.hcl

RUN         apt update -y && \
            apt upgrade -y && \
            apt install -y gpg wget lsb-release curl && \
            wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
            gpg --no-default-keyring --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg --fingerprint && \
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
            apt update -y && \
            apt install -y vault && \
            apt-get update && \
            apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release && \
            curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
            echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
            apt-get update && \
            apt-get install -y docker-ce docker-ce-cli containerd.io

COPY        ./tools/script.sh /script.sh
RUN         chmod +x /script.sh

VOLUME      /var/run/docker.sock

CMD         vault server -config=config.hcl & \
            sleep 1 && \
            ./script.sh && \
            tail -f /dev/null