#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER mnemosine WITH PASSWORD 'mnemosine_pass';
CREATE DATABASE memory_management;
GRANT ALL PRIVILEGES ON DATABASE memory_management TO mnemosine;
EOSQL
