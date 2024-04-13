#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/logstash/logstash:8.12.2

#---- variables -------------------------------------------------------#

# ARG     ELASTIC_USER
# ARG     ELASTIC_PASSWORD

# RUN     export ELASTIC_PASSWORD=ELASTIC_PASSWORD                    && \
#         export ELASTIC_USER=ELASTIC_USER

#---- config ----------------------------------------------------------#

COPY    conf/logstash.conf /usr/share/logstash/config/logstash.conf
COPY    conf/logstash.yml /usr/share/logstash/config/logstash.yml