#!/bin/sh

pip install -r shared/shared_requirements.txt 2> /dev/null 1> /dev/null
:q
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8003
# gunicorn --bind 0.0.0.0:8003 cupidon_project.wsgi:application
