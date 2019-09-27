from django.conf import settings
from django.db import migrations, models
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


def create_groups_and_permissions(apps, schema_editor):
    if ContentType.objects.filter(app_label='auth', model='user').exists():
        content_type = ContentType.objects.get(app_label='auth', model='user')
        Permission.objects.create(codename='scilo_basic_instuctor', name='instuctor permission', content_type=content_type)
        Permission.objects.create(codename='scilo_basic_student', name='student permission', content_type=content_type)

class Migration(migrations.Migration):
    dependencies = [
        ('polls', '0064_auto_20190924_1854'),
    ]

    operations = [
        migrations.RunPython(create_groups_and_permissions)
    ]