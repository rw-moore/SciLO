# Generated by Django 3.0.8 on 2021-04-19 02:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0111_response_patternfeedback'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='attempt',
            name='quiz_info',
        ),
    ]