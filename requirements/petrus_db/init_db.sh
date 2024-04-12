#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $PETRUS_USER WITH PASSWORD '$PETRUS_PASSWORD';
CREATE DATABASE $PETRUS_DB;
GRANT ALL PRIVILEGES ON DATABASE $PETRUS_DB TO $PETRUS_USER;
EOSQL