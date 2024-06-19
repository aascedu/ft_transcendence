#!/bin/sh

daphne -b 0.0.0.0 -p 8002 coubertin_project.asgi:application
