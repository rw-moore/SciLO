# Generated by Django 3.0.8 on 2021-10-26 17:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0114_attempt_create_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag',
            name='name',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]