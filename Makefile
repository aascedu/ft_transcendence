#---- Makefile --------------------------------------------------------#

#---- variables -------------------------------------------------------#

include .env
ENV_FILE		=	.env
VOLUMES_DIR		=	certification_data elasticsearch_data \
					logstash_data kibana_data alfred_data \
					mnemosine_data petrus_data filebeat_data
VOLUMES_PATH	=	$(HOME)/data/transcendence_data
VOLUMES			=	$(addprefix $(VOLUMES_PATH)/, $(VOLUMES_DIR))
DJANGO_CTT		=	alfred coubertin cupidon hermes ludo \
					mnemosine petrus

#---- docker commands -------------------------------------------------#

WHO                =    $(shell whoami)

ifeq ($(WHO), bpoumeau)
DOCKER_FILE        =    docker-compose-nologs.yml
else ifeq ($(WHO), ccrottie)
DOCKER_FILE        =    docker-compose-nologs.yml
else ifeq ($(WHO), hgeffroy)
DOCKER_FILE        =    docker-compose-nologs.yml
else
DOCKER_FILE        =    docker-compose.yml
endif
COMPOSE		=	docker compose
COMPOSE_F	=	docker compose -f
STOP		=	docker compose stop
RM			=	docker compose rm
RM_IMG		=	docker rmi
VOLUME		=	docker volume
NETWORK		=	docker network
SYSTEM		=	docker system

#---- rules -----------------------------------------------------------#

#---- base ----#
debug: | copyfile volumes modsec tutum
	. ./tools/init.sh

all: | copyfile volumes modsec tutum
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) up -d --build --remove-orphans

up: | copyfile volumes tutum
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) up -d

ifeq ($(CI), ci)
build: | copyfile volumes
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) build
else
build: | copyfile volumes modsec
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) build
endif

#---- build rules ----#

build_parallel:
	$(COMPOSE) build --parallel

watch:
	$(COMPOSE) watch

dry_run:
	$(COMPOSE) --dry-run up --build -d

#---- stop rules ----#

down:
	$(COMPOSE) down

down_restart:
	$(COMPOSE) down -v

restart:
	$(COMPOSE) restart

kill:
	$(COMPOSE) kill

reset: | fclean
	make debug

#---- setups ----#

volumes:
	mkdir -p $(VOLUMES)

copyfile:
	./tools/copyfile.sh $(DJANGO_CTT)

modsec:
	./tools/modsec.sh

tutum:
	$(COMPOSE_F) $(DOCKER_FILE) up -d tutum

test: copyfile
	./tools/test.sh $(DJANGO_CTT)

#---- clean ----#
# - Stops all running containers
# - Removes all stopped containers
# - Stops Docker Compose services
# - Cleans specific directories and files (migrations, tokens, vault)
clean: | down
	- docker stop $$(docker ps -qa) || true
	- docker rm $$(docker ps -qa) || true
	- $(COMPOSE) stop || true
	- rm -rf `find . | grep migrations | grep -v env` || true
	- rm -rf ./tokens || true
	- rm -rf ./requirements/tutum/vault || true
#	- rm -rf ./requirements/aegis/ModSecurity || true

# - Completely removes Docker Compose services, including images, volumes, and orphans
# - Removes all Docker images
# - Removes all Docker volumes
# - Removes all Docker networks
# - Cleans the specified volume path
fclean: | clean
	- $(COMPOSE) down --rmi all --volumes --remove-orphans || true
	- docker rmi $$(docker images -q) || true
	- docker volume rm $$(docker volume ls -q) || true
	- docker network rm $$(docker network ls -q) 2>/dev/null || true
	- rm -rf $(VOLUMES_PATH)/*

# - Removes all unused Docker data, including images, containers, volumes, and networks
prune: | fclean
	- docker system prune -af || true
	- docker volume prune -af || true
#	- rm -rf ./requirements/aegis/ModSecurity/ || true

db_suppr:
	rm -rf `find . | grep db.sqlite3`

db_reset: db_suppr copyfile

#---- re ----#

ifeq ($(WHO), twang)
re: fclean debug
else
re: down debug
endif
# pour la prod: remettre up

#---- settings --------------------------------------------------------#

.SILENT:
.DEFAULT: debug # pour la prod: remettre all
.PHONY: all up build down build_parallel down_restart restart kill reset \
        volumes copyfile modsec tutum test clean fclean prune \
        db_suppr db_reset re

