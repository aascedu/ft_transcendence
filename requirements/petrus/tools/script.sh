#!/bin/sh

if [ -z "${MAKE_MIGRATIONS}" ]; then
    echo "MAKE_MIGRATIONS is set"
    python manage.py makemigrations
    python manage.py makemigrations signin
fi
python manage.py migrate
python manage.py migrate signin
# python manage.py runserver 0.0.0.0:8009
gunicorn --bind 0.0.0.0:8009 petrus_project.wsgi:application
