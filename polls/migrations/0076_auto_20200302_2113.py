# Generated by Django 2.2.5 on 2020-03-02 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0075_auto_20200302_2108'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='text',
            field=models.TextField(blank=True, default=''),
        ),
    ]
