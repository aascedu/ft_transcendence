#---- ModSec base image -----------------------------------------------#
FROM aascedu/nginx-modsec:files AS modsec

#---- variables -------------------------------------------------------#

ARG     PROXY_CONF
RUN     export PROXY_CONF=PROXY_CONF

#---- config ----------------------------------------------------------#

COPY    conf/crs-setup.conf /etc/nginx/modsec/coreruleset-4.0.0/crs-setup.conf

COPY    conf/ /etc/nginx/modsec

COPY    conf/${PROXY_CONF} /etc/nginx/nginx.conf
COPY    errorPages /usr/share/nginx/html

#---- config ----------------------------------------------------------#

RUN     ln -s /etc/nginx/conf.d/sites-available/nginx.conf /etc/nginx/conf.d/sites-enabled

#---- TSL/SSL certification -------------------------------------------#

RUN     mkdir -p /data/nginx/cache &&                                  \
        mkdir -p /etc/nginx/ssl &&                                     \
        apk add --update --no-cache openssl &&                         \
        openssl req -x509 -nodes                                       \
            -out /etc/nginx/ssl/ft_transcendence.crt                   \
            -keyout /etc/nginx/ssl/ft_transcendence.key                \
            -subj "/C=FR/L=Lyon/CN=batch42.me" ||                      \
            { echo "SSL certification failed"; exit 1; }
        #      &&            \
        # openssl req -x509 -nodes                                       \
        #     -out /etc/nginx/ssl/elastic.crt                            \
        #     -keyout /etc/nginx/ssl/elastic.key                         \
        #     -subj "/C=FR/L=Lyon/CN=elasticsearch.test.me" ||           \
        #     { echo "SSL elastic certification failed"; exit 1; }

# By default the Alpine image automatically streams Nginx logs (access and error logs) to stdout and stderr
# by creating a symbolic link from stdout to /var/log/nginx/access.log and stderr to /var/log/nginx/error.log
# Lets remove these symbolic links so that we can setup a volume and persist the logs so that they are available
# between restarts
# RUN     unlink /var/log/nginx/access.log && \
#         unlink /var/log/nginx/error.log && \
#         touch /var/log/nginx/access.log /var/log/nginx/error.log && \
#         chown nginx:nginx /var/log/nginx/access.log /var/log/nginx/error.log && \
#         chmod 644 /var/log/nginx/access.log /var/log/nginx/error.log