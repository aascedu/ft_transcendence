#---- base image ------------------------------------------------------#

FROM    docker.elastic.co/logstash/logstash:8.12.2

#---- env args --------------------------------------------------------#

ENV     PLUGIN_BIN "/usr/share/logstash/bin/logstash-plugin"

#---- plugins for logstash --------------------------------------------#

RUN     "$PLUGIN_BIN" install logstash-input-syslog
# RUN "$PLUGIN_BIN" install logstash-filter-date
RUN     "$PLUGIN_BIN" install logstash-filter-grok
# RUN "$PLUGIN_BIN" install logstash-filter-useragent
RUN     "$PLUGIN_BIN" install logstash-output-elasticsearch

#---- configuration files ---------------------------------------------#

COPY    conf/logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY    patterns /usr/share/logstash/patterns

#---- launch ---------------------------------------------------------#

CMD ["-f", "/usr/share/logstash/pipeline/logstash.conf"]
