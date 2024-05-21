#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/logstash/logstash:8.12.2

#---- configuration files ---------------------------------------------#

COPY    conf/logstash.conf /usr/share/logstash/pipeline/logstash.conf

#---- launch ---------------------------------------------------------#

CMD ["-f", "/usr/share/logstash/pipeline/logstash.conf"]
