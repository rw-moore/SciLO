from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from .user import User


class Category(models.Model):

    '''
    this class is to represent a category, a category is to store
    some files like quiz (Quiz) or question (Question)


    title: string, name of Category

    create_date: Date, create date

    last_modify_date: Date,  last modify date

    author: User, the user who creates this Category

    parent: Category, each category can have parent-categories(Category)

    children: [Category], the back reference of parent

    save(*args, **kwargs): overwirte save method to avoid froeignkey to
    self object

    '''

    class Meta:
        abstract = True

    title = models.CharField(max_length=200, null=True)
    create_date = models.DateTimeField(default=timezone.now)
    last_modify_date = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE,
                               null=True, blank=True)

    parent = models.ForeignKey('self',
                               on_delete=models.CASCADE,
                               related_name='children',
                               blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.parent and self.parent.pk == self.pk:
            raise ValidationError('You can\'t have yourself as a parent!')
        return super(Category, self).save(*args, **kwargs)

    def __str__(self):
        return super().__str__()+' title: '+str(self.title)

    @classmethod
    def create_from_json(cls, json_dict):
        from copy import deepcopy
        from .question import Question
        category_dict = deepcopy(json_dict)
        if category_dict:
            question_list = category_dict.pop('questions', [])
            # generate questions and save in database
            instance = cls.objects.create(**category_dict)
            instance.questions.set(
                [Question.create_from_json(question_dict) for question_dict in question_list]
            )
            return instance
        else:
            return None

    def get_children(self):
        return list(self.children.all())


class QuizCategory(Category):
    '''
    QuizCattegory is Quiz bank

    quizzes: [Quiz]
    '''
    class Meta:
        app_label = 'polls'

class QuestionCategory(Category):
    '''
    QuestionCategory is Question bank

    questions: [Question]
    '''
    class Meta:
        app_label = 'polls'
