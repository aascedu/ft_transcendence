# Generated by Django 5.0.6 on 2024-06-24 16:52

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_management', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='nick',
            field=models.CharField(max_length=10, unique=True, validators=[django.core.validators.RegexValidator(message='Nick must contain 3 to 10 characters, (uppercase, lowercase, digit or underscore)', regex='^[a-zA-Z0-9_]{3,10}$')]),
        ),
    ]
