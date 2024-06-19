#!/bin/sh

if [ -z "${MAKE_MIGRATIONS}" ]; then
    echo "MAKE_MIGRATIONS is set"
    python manage.py makemigrations
    python manage.py makemigrations memory
fi
python manage.py migrate
python manage.py migrate memory

daphne -b 0.0.0.0 -p 8008 mnemosine_project.asgi:application