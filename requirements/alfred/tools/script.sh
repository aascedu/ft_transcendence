#!/bin/sh

if [ -z "${MAKE_MIGRATIONS}" ]; then
    echo "MAKE_MIGRATIONS is set"
    echo "Making migrations"
    python manage.py makemigrations
    python manage.py makemigrations user_management
fi

python manage.py migrate
python manage.py migrate user_management

daphne -b 0.0.0.0 -p 8001 alfred_project.asgi:application
