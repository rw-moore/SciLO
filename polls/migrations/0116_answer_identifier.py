# Generated by Django 3.0.8 on 2021-12-22 00:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0115_auto_20211026_1702'),
    ]

    operations = [
        migrations.AddField(
            model_name='answer',
            name='identifier',
            field=models.TextField(blank=True, null=True),
        ),
    ]
