# Generated by Django 2.2.1 on 2019-05-18 22:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0018_auto_20190518_2215'),
    ]

    operations = [
        migrations.RenameField(
            model_name='question',
            old_name='tag',
            new_name='tags',
        ),
    ]