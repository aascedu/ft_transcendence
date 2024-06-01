#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/elasticsearch/elasticsearch:8.13.1

#---- configuration files ---------------------------------------------#

RUN     mkdir -p /usr/share/elasticsearch/scripts

# RUN     chmod +x scripts/logs_policy.sh
COPY    scripts/logs_policy.sh /usr/share/elasticsearch/scripts/

#---- scripts ---------------------------------------------------------#

CMD ["/usr/share/elasticsearch/scripts/logs_policy.sh"]