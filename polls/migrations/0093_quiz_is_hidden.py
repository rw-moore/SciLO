# Generated by Django 3.0.6 on 2020-06-23 22:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0092_auto_20200619_0354'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='is_hidden',
            field=models.BooleanField(default=False),
        ),
    ]
