# Generated by Django 3.0.6 on 2020-06-04 19:16

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
        ('polls', '0086_userprofile_is_instructor'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserRole',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.AlterModelOptions(
            name='course',
            options={'permissions': [('move_users', 'Can add or delete a user in the course'), ('delete_questions_from_course', 'Delete questions in the course question bank')]},
        ),
        migrations.RemoveConstraint(
            model_name='role',
            name='unique_role',
        ),
        migrations.RemoveField(
            model_name='course',
            name='groups',
        ),
        migrations.RemoveField(
            model_name='role',
            name='course',
        ),
        migrations.RemoveField(
            model_name='role',
            name='role',
        ),
        migrations.RemoveField(
            model_name='role',
            name='user',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='is_instructor',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='roles',
        ),
        migrations.AddField(
            model_name='role',
            name='permissions',
            field=models.ManyToManyField(blank=True, to='auth.Permission'),
        ),
        migrations.AddField(
            model_name='role',
            name='role_name',
            field=models.CharField(default='', max_length=200, unique=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='userrole',
            name='course',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user_role', to='polls.Course'),
        ),
        migrations.AddField(
            model_name='userrole',
            name='role',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_role', to='polls.Role'),
        ),
        migrations.AddField(
            model_name='userrole',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='userrole',
            constraint=models.UniqueConstraint(fields=('course_id', 'user_id'), name='unique_role'),
        ),
    ]
