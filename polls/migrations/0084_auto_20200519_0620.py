# Generated by Django 3.0.6 on 2020-05-19 06:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0083_auto_20200519_0620'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='course',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='roles', to='polls.Course'),
        ),
    ]
