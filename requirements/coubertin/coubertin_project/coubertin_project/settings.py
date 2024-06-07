"""
Django settings for coubertin_project project.

Generated by 'django-admin startproject' using Django 5.0.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""
from shared.settings import SHARED_MIDDLEWARE as shared_middleware, add_prometheused_middleware, LOGGING
from shared.settings import add_prometheused_apps
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-r0u6)*5c349+vco)%e5w+#a*+_2#2t4nh)%zqnn7fx0)*o!=w7'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

PROJECT_APPS = [
    'daphne',
    'tournament',
    'channels',
]

INSTALLED_APPS = add_prometheused_apps(PROJECT_APPS)

PROJECT_OWN_MIDDLEWARE = []

MIDDLEWARE = add_prometheused_middleware(shared_middleware + PROJECT_OWN_MIDDLEWARE)

ROOT_URLCONF = 'coubertin_project.urls'

WSGI_APPLICATION = 'coubertin_project.wsgi.application'

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

ASGI_APPLICATION = "coubertin_project.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}
