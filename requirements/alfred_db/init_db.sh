#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $ALFRED_USER WITH PASSWORD '$ALFRED_PASSWORD';
CREATE DATABASE $ALFRED_DB;
GRANT ALL PRIVILEGES ON DATABASE $ALFRED_DB TO $ALFRED_USER;
EOSQL