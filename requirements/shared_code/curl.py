#!/usr/bin/python3

import requests
import sys

if len(sys.argv) < 1:
    sys.exit(1)
else:
    url = sys.argv[1]

response = None
try:
    response = requests.get(url)
    if response.status_code != 200:
        raise BaseException
except BaseException:
    sys.exit(1)
