#!/bin/sh

daphne -b 0.0.0.0 -p 8004 hermes_project.asgi:application