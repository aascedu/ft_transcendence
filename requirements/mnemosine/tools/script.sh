#!/bin/sh

python manage.py migrate
python manage.py migrate memory
python manage.py runserver 0.0.0.0:8008
# gunicorn --bind 0.0.0.0:8008 mnemosine_project.wsgi:application
