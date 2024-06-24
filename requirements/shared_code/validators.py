from django.core import validators

NickNameValidator = validators.RegexValidator(
        regex=r'^[a-zA-Z0-9_]{3,10}$',
        message="Nick must contain 3 to 10 characters, (uppercase, lowercase, digit or underscore)"
    )
