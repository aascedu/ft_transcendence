FROM        postgres:13

#COPY        init_db.sh /docker-entrypoint-initdb.d/
COPY        entrypoint.sh /entrypoint.sh

RUN         apt update -y && \
            apt upgrade -y && \
            apt install curl jq -y

ENTRYPOINT  ["sh", "entrypoint.sh"]