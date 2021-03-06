# Generated by Django 3.0.6 on 2020-05-20 03:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0083_merge_20200519_2156'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='is_admin',
        ),
        migrations.AlterField(
            model_name='role',
            name='role',
            field=models.PositiveSmallIntegerField(choices=[(1, 'student'), (2, 'nonediting_ta'), (3, 'editing_ta'), (4, 'instructor')], default=1),
        ),
    ]
