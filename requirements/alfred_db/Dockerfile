<<<<<<< HEAD
FROM        postgres:13

#COPY        init_db.sh /docker-entrypoint-initdb.d/
COPY        entrypoint.sh /entrypoint.sh

RUN         apt update -y && \
            apt upgrade -y && \
            apt install curl jq -y

ENTRYPOINT  ["sh", "entrypoint.sh"]
=======
FROM    postgres:13

COPY    init_db.sh /docker-entrypoint-initdb.d/
>>>>>>> 28b68c756f723b470847406fd37d3516b1f0d851
