#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER alfred WITH PASSWORD 'alfred_pass';
CREATE DATABASE user_management;
GRANT ALL PRIVILEGES ON DATABASE user_management TO alfred;
EOSQL
