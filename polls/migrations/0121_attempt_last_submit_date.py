# Generated by Django 3.0.8 on 2022-03-10 22:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0120_auto_20220304_0742'),
    ]

    operations = [
        migrations.AddField(
            model_name='attempt',
            name='last_submit_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]