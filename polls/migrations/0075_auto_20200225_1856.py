# Generated by Django 2.2.2 on 2020-02-25 18:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0074_auto_20191125_0027'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='text',
            field=models.TextField(blank=True, null=True),
        ),
    ]