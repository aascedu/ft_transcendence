import os

SHARED_MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",

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

if os.getenv("PROXY_CONF") != "proxy.conf":
    LOGGING = None
else:
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG",
            },
            "logstash": {
                "level": "DEBUG",
                "class": "logging.handlers.SysLogHandler",
                "facility": "user",
                "address": ("aether", 5140),
                "socktype": SOCK_STREAM,
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
