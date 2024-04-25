FROM    postgres:13

COPY    init_db.sh /docker-entrypoint-initdb.d/

RUN     apt update -y && \
        apt upgrade -y && \
        apt install curl jq -y