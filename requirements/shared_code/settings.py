import os
from socket import SOCK_STREAM

SHARED_MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    'shared.Middleware.LoggingRequestMiddleware',
    'shared.Middleware.RawJsonToDataGetMiddleware',
    'shared.Middleware.JWTIdentificationMiddleware',
    # 'shared.Middleware.ensureIdentificationMiddleware',
]

def add_prometheused_middleware(middlewares):
    BEFORE_PROMETHEUS = ["django_prometheus.middleware.PrometheusBeforeMiddleware"]
    AFTER_PROMETHEUS = ["django_prometheus.middleware.PrometheusAfterMiddleware"]
    COMBINED = BEFORE_PROMETHEUS + middlewares + AFTER_PROMETHEUS
    return COMBINED

def add_prometheused_apps(apps):
    PROMETHEUS_APP = ["django_prometheus"]
    COMBINED = PROMETHEUS_APP + apps
    return COMBINED

if os.getenv('NOLOGS'):
    print("No logs mode set")
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "logstash": {
                "()": "syslog_rfc5424_formatter.RFC5424Formatter"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG",
            },
        },
        "loggers": {
            "": {
                "handlers": ["console"],
                "level": "DEBUG",
                "propagate": False,
            },
        },
    }
else:
    print("Logging mode set")
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "logstash": {
                "()": "syslog_rfc5424_formatter.RFC5424Formatter"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG",
            },
            "logstash": {
                "level": "DEBUG",
                "class": "logging.handlers.SysLogHandler",
                "address": ("aether", 5141),
                "socktype": SOCK_STREAM,
                "formatter" : "logstash",
            },
        },
        "loggers": {
            "": {
                "handlers": ["logstash", "console"],
                "level": "DEBUG",
                "propagate": False,
            },
        },
    }
