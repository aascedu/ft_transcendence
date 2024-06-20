#!/bin/sh

python manage.py runserver 0.0.0.0:8004
# daphne -b 0.0.0.0 -p 8004 hermes_project.asgi:application