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
