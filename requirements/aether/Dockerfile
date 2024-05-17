#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/logstash/logstash:8.12.2

#---- env args --------------------------------------------------------#

ENV     PLUGIN_BIN "/usr/share/logstash/bin/logstash-plugin"

#---- configuration files ---------------------------------------------#

COPY    conf/logstash.conf /usr/share/logstash/pipeline/logstash.conf

#---- launch ---------------------------------------------------------#

CMD ["-f", "/usr/share/logstash/pipeline/logstash.conf"]
