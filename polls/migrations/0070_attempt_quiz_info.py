# Generated by Django 2.2.5 on 2019-11-12 20:51

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0069_auto_20191101_2324'),
    ]

    operations = [
        migrations.AddField(
            model_name='attempt',
            name='quiz_info',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=dict),
        ),
    ]