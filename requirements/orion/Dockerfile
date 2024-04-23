#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/beats/filebeat:8.13.2

#---- variables -------------------------------------------------------#

ARG     ELASTIC_USER
ARG     ELASTIC_PASSWORD

RUN     export ELASTIC_PASSWORD=ELASTIC_PASSWORD                    && \
        export ELASTIC_USER=ELASTIC_USER


#---- config ----------------------------------------------------------#

COPY    conf/filebeat.yml /usr/share/filebeat/filebeat.yml
# COPY    conf/filebeat.reference.yml /usr/share/filebeat/filebeat.reference.yml
# COPY    conf/filebeat.reference.yml /usr/share/filebeat/filebeat.yml
# CMD     ["modules", "list"]