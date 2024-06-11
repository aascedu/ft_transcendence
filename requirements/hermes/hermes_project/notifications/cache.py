from django.core.cache import cache
from redis.exceptions import ConnectionError, TimeoutError, ResponseError

def set_cache(key, value):
    try:
        cache.set(key, value)
    except (ConnectionError, TimeoutError, ResponseError) as e:
        print(f'Error: undefined behavior concerning cache access : {e} : setting {key}')

def get_cache(key):
    try:
        return cache.get(key)
    except (ConnectionError, TimeoutError, ResponseError) as e:
        print(f'Error: undefined behavior concerning cache : {e} : getting {key}')
        return None

def delete_cache(key):
    try:
        cache.delete(key)
    except (ConnectionError, TimeoutError, ResponseError) as e:
        print(f'Error: undefined behavior concerning cache : {e} : deleting {key}')
