# Generated by Django 2.2.1 on 2019-05-28 01:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0020_auto_20190528_0059'),
    ]

    operations = [
        migrations.RenameField(
            model_name='response',
            old_name='content',
            new_name='text',
        ),
    ]