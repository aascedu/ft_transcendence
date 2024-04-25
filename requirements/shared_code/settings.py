SHARED_MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",

    'shared.Middleware.RawJsonToDataGetMiddleware',
    'shared.Middleware.JWTIdentificationMiddleware',
    # 'shared.Middleware.ensureIdentificationMiddleware',
]

def add_prometheused_middleware(middlewares):
    return middlewares
