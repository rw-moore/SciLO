# Generated by Django 2.2.5 on 2019-11-01 23:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0068_auto_20191015_1853'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='language',
        ),
        migrations.RemoveField(
            model_name='question',
            name='script',
        ),
    ]