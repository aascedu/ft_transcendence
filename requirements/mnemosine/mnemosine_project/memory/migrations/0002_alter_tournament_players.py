# Generated by Django 5.0.3 on 2024-05-17 12:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('memory', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='players',
            field=models.ManyToManyField(related_name='tournaments', to='memory.player'),
        ),
    ]