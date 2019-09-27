# Generated by Django 2.2.5 on 2019-09-24 18:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0063_question_course'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quiz',
            name='course',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='quizzes', to='polls.Course'),
        ),
    ]