#!/bin/sh

python manage.py makemigrations
python manage.py makemigrations user_management
python manage.py migrate
python manage.py migrate user_management
python manage.py runserver 0.0.0.0:8001
# gunicorn --bind 0.0.0.0:8001 alfred_project.wsgi:application
