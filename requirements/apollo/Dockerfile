#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/elasticsearch/elasticsearch:8.13.1

#---- configuration files ---------------------------------------------#

RUN     mkdir -p /usr/share/elasticsearch/scripts
RUN     chmod -R +x scripts/

COPY    --chown=root:root conf/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
COPY    scripts/*.sh /usr/share/elasticsearch/scripts

#---- launch ----------------------------------------------------------#
