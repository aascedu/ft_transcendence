#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/beats/filebeat:8.13.2

#---- config ----------------------------------------------------------#

COPY    conf/filebeat.reference.yml /usr/share/filebeat/filebeat.reference.yml
COPY    conf/filebeat.yml /usr/share/filebeat/filebeat.yml
COPY    conf/system.yml /usr/share/filebeat/modules.d/system.yml
COPY    conf/logstash.yml /usr/share/filebeat/modules.d/logstash.yml
COPY    conf/nginx.yml /usr/share/filebeat/modules.d/nginx.yml