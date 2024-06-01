#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/elasticsearch/elasticsearch:8.13.1

#---- configuration files ---------------------------------------------#

RUN     mkdir -p /usr/share/elasticsearch/scripts && \
        chmod -R +x scripts/

COPY    scripts/*.sh /usr/share/elasticsearch/scripts

#---- launch ----------------------------------------------------------#

# run scripts in the right order here ? maybe launch docker separately and script outside ...