#!/bin/sh

pip install -r shared/shared_requirements.txt 2> /dev/null 1> /dev/null
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8009
# gunicorn --bind 0.0.0.0:8009 petrus_project.wsgi:application
