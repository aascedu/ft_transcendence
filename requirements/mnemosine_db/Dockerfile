FROM    postgres:13

COPY    init_db.sh /docker-entrypoint-initdb.d/

RUN     apt-get update -y && \
        apt-get upgrade -y && \
        apt-get install curl jq -y