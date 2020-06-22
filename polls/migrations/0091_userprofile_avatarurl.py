# Generated by Django 3.0.6 on 2020-06-19 00:50

from django.db import migrations, models

def add_methods(apps, schema_editor):
    AuthMethod = apps.get_model("polls", "AuthMethod")
    db_alias = schema_editor.connection.alias
    google = AuthMethod.objects.using(db_alias).create(method='Google')
    userpass = AuthMethod.objects.using(db_alias).create(method='Username/Password')
    Users = apps.get_model("polls", "userprofile")
    for user in Users.objects.using(db_alias).all():
        user.auth_methods.add(google, userpass)
        user.save()



class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0090_auto_20200613_0357'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='avatarurl',
            field=models.URLField(null=True),
        ),
        migrations.CreateModel(
            name='AuthMethod',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('method', models.CharField(max_length=200, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='userprofile',
            name='auth_methods',
            field=models.ManyToManyField(to='polls.AuthMethod'),
        ),
        migrations.RunPython(add_methods),
    ]
