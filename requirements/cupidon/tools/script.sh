#!/bin/sh

# daphne -b 0.0.0.0 -p 8003 cupidon_project.asgi:application
python3 manage.py runserver 0.0.0.0:8003