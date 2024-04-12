#---- Makefile --------------------------------------------------------#

#---- variables -------------------------------------------------------#

ENV_FILE		=	.env

WHO				=	$(shell whoami)
ifeq ($(WHO), twang)
DOCKER_FILE		=	docker-compose-twang.yml
else ifeq ($(WHO), bpoumeau)
DOCKER_FILE		=	docker-compose-nologs.yml
else ifeq ($(WHO), ccrottie)
DOCKER_FILE		=	docker-compose-nologs.yml
else ifeq ($(WHO), hgeffroy)
DOCKER_FILE		=	docker-compose-nologs.yml
else
DOCKER_FILE		=	docker-compose.yml
endif

VOLUMES_DIR		=	certification_data elasticsearch_data \
					logstash_data kibana_data alfred_data \
					mnemosine_data petrus_data
VOLUMES_PATH	=	$(HOME)/data/transcendence_data
VOLUMES			=	$(addprefix $(VOLUMES_PATH)/, $(VOLUMES_DIR))
DJANGO_CTT		=	alfred coubertin cupidon hermes lovelace ludo \
					mnemosine petrus

#---- docker commands -------------------------------------------------#

COMPOSE		=	docker compose
COMPOSE_F	=	docker compose -f
STOP		=	docker stop
RM			=	docker rm
RM_IMG		=	docker rmi
VOLUME		=	docker volume
NETWORK		=	docker network
SYSTEM		=	docker system

#---- rules -----------------------------------------------------------#

#---- base ----#
debug: | volumes modsec
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) up --build

all: | migrate volumes modsec
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) up -d --build

up: | migrate volumes
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) up -d

build: | migrate volumes modsec
	$(COMPOSE_F) $(DOCKER_FILE) --env-file $(ENV_FILE) build

down:
	$(COMPOSE_F) $(DOCKER_FILE) down

restart:
	$(COMPOSE_F) $(DOCKER_FILE) restart

reset: | db_reset
	make debug

#---- setups ----#

volumes:
	mkdir -p $(VOLUMES)

migrate:
	./tools/migrate.sh $(DJANGO_CTT)

modsec:
	./tools/modsec.sh

#---- debug ----#

aegis:
	$(COMPOSE) up -d aegis
	$(COMPOSE_F) $(DOCKER_FILE) exec aegis sh

aether:
	$(COMPOSE) up -d aether
	$(COMPOSE_F) $(DOCKER_FILE) exec aether /bin/bash

alfred:
	$(COMPOSE) up -d alfred
	$(COMPOSE_F) $(DOCKER_FILE) exec alfred bash

apollo:
	$(COMPOSE) up -d apollo
	$(COMPOSE_F) $(DOCKER_FILE) exec apollo /bin/bash

coubertin:
	$(COMPOSE) up -d coubertin
	$(COMPOSE_F) $(DOCKER_FILE) exec coubertin bash

cupidon:
	$(COMPOSE) up -d cupidon
	$(COMPOSE_F) $(DOCKER_FILE) exec cupidon bash

davinci:
	$(COMPOSE) up -d davinci
	$(COMPOSE_F) $(DOCKER_FILE) exec davinci /bin/bash

hermes:
	$(COMPOSE) up -d hermes
	$(COMPOSE_F) $(DOCKER_FILE) exec hermes bash

iris:
	$(COMPOSE) up -d iris
	$(COMPOSE_F) $(DOCKER_FILE) exec iris /bin/bash

lovelace:
	$(COMPOSE) up -d lovelace
	$(COMPOSE_F) $(DOCKER_FILE) exec lovelace bash

ludo:
	$(COMPOSE) up -d ludo
	$(COMPOSE_F) $(DOCKER_FILE) exec ludo bash

malevitch:
	$(COMPOSE) up -d malevitch
	$(COMPOSE_F) $(DOCKER_FILE) exec malevitch /bin/bash

mensura:
	$(COMPOSE) up -d mensura
	$(COMPOSE_F) $(DOCKER_FILE) exec mensura /bin/bash

mnemosine:
	$(COMPOSE) up -d mnemosine
	$(COMPOSE_F) $(DOCKER_FILE) exec mnemosine bash

orion:
	$(COMPOSE) up -d orion
	$(COMPOSE_F) $(DOCKER_FILE) exec orion /bin/bash

petrus:
	$(COMPOSE) up -d petrus
	$(COMPOSE_F) $(DOCKER_FILE) exec petrus bash

#---- clean ----#

clean: down
	- $(COMPOSE_F) $(DOCKER_FILE) down --rmi all --volumes --remove-orphans
	- rm -rf `find . | grep migrations | grep -v env`
	- rm -rf $(VOLUMES_PATH)/* || true
	- rm -rf ./tokens || true
	- rm -rf ./requirements/tutum/vault || true
#	- rm -rf ./requirements/aegis/ModSecurity || true
#	- rm ./requirements/shared_code/shared_token.py || true

fclean: clean
	- $(STOP) $$(docker ps -qa)
	- $(RM) $$(docker ps -qa)
	- $(RM_IMG) $$(docker images -qa)
	- $(NETWORK) rm $$(docker network ls -q) 2>/dev/null
	- docker rmi $$(docker images -qa)

prune:
	- $(STOP) $$(docker ps -qa)
	- $(SYSTEM) prune -af
	- $(VOLUME) prune -af
#	- rm -rf ./requirements/aegis/ModSecurity/

db_suppr:
	rm -rf `find . | grep db.sqlite3`

db_reset: db_suppr migrate

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
.PHONY: all up build down volumes migrate debug clean fclean prune re \
aegis alfred apollo coubertin cupidon davinci hermes iris lovelace \
ludo malevitch mensura mnemosine petrus aether modsec db_suppr db_reset
