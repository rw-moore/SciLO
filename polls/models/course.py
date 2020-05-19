
from django.db import models
from django.contrib.auth.models import Group
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
# from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .role import Role


class Course(models.Model):
    '''
    each course has two default groups, shortname+_student_group and shortname+_professor_group
    shortname+_student_group has two permissions: scilo_basic_student, course_+id+_student
    shortname+_professor_group has two permissions: scilo_basic_professor, course_+id+_professor
    '''

    groups = models.ManyToManyField(Group)
    fullname = models.CharField(max_length=200, null=False, blank=False, unique=True)
    shortname = models.CharField(max_length=50, null=False, blank=False, unique=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'polls'

    def create_group(self, name):
        if self.pk:
            self.groups.add(Group.objects.create(name=self.shortname+'_'+name))
            self.save()


@receiver(pre_delete, sender=Course)
def delete_repo(sender, instance, **kwargs):
    gs = Group.objects.filter(
        Q(name='COURSE_'+instance.shortname+'_student_group') | Q(name='COURSE_'+instance.shortname+'_instructor_group'))
    gs.delete()


@receiver(post_save, sender=Course)
def create_course_group(sender, instance, created, **kwargs):
    if created:
        try:
            for role in Role.ROLE_CHOICES:
                newgroup = Group.objects.create(name='COURSE_'+instance.shortname+'_'+role[1]+'_group')
                instance.groups.add(newgroup)
        except Exception as e:
            instance.delete()
            raise e
