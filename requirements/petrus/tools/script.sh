#!/bin/sh

python manage.py migrate
python manage.py migrate signin
python manage.py runserver 0.0.0.0:8009
# gunicorn --bind 0.0.0.0:8009 petrus_project.wsgi:application
