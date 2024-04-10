#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER petrus WITH PASSWORD 'petrus_pass';
CREATE DATABASE auth_management;
GRANT ALL PRIVILEGES ON DATABASE auth_management TO petrus;
EOSQL
