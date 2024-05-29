FROM    docker.elastic.co/beats/filebeat:8.12.2

COPY    --chown=root:filebeat conf/filebeat.yml /usr/share/filebeat/filebeat.yml
COPY    modules/nginx.yml /usr/share/filebeat/modules.d/
