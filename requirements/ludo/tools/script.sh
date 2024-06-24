#!/bin/sh

daphne -b 0.0.0.0 -p 8006 ludo_project.asgi:application
