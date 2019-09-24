
from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import JSONField
from .user import User
from .course import Course
from .question import Question


class Quiz(models.Model):
    '''
    this class is to represent a quiz

    title: string, max length 200

    description: string, the quiz's background text

    weight: int, the quiz's total weight, example: 100

    bonus: int, the quiz's bonus mark, example: 20

    create_date: Date

    last_modify_date: Date

    author: User, user who creates this quiz

    category: QuizCategory, the category this quiz belongs to

    questions: [Question], the questions that this quiz has

    '''
    class Meta:
        app_label = 'polls'

    title = models.CharField(max_length=200)
    bonus = models.PositiveSmallIntegerField(default=0)
    last_modify_date = models.DateTimeField(default=timezone.now)
    begin_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True, related_name='quizzes')
    late_time = models.DateTimeField(null=True, blank=True)
    show_solution_date = models.DateTimeField(null=True, blank=True)
    questions = models.ManyToManyField(Question, through='QuizQuestion')
    options = JSONField(default=dict)

    def __str__(self):
        return super().__str__()+' title: '+str(self.title)

    def clear_quiz_question_links(self, question_id=None):
        if self.pk:
            if question_id is None:
                QuizQuestion.objects.filter(quiz=self.pk).delete()
            else:
                QuizQuestion.objects.filter(quiz=self.pk, question=question_id).delete()

    def set_quiz_question_links(self, questions):
        if questions is None:
            return
        from polls.serializers import QuizQuestionSerializer
        if self.pk:
            quizquestion = [{
                'question': question['id'],
                'quiz': self.pk,
                'mark': question.get('mark', None)
                } for question in questions]
            serializer = QuizQuestionSerializer(data=quizquestion, many=True)
            if serializer.is_valid():
                serializer.save()
            else:
                raise Exception(serializer.errors)

    def update_quiz_question_links(self, questions):
        if questions is None:
            return
        self.clear_quiz_question_links()
        self.set_quiz_question_links(questions)



class QuizQuestion(models.Model):
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE, related_name='quizlinkback')
    mark = models.PositiveSmallIntegerField(null=True, blank=True)
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='questionlinkback')
    position = models.PositiveIntegerField()

    class Meta:
        app_label = 'polls'
        ordering = ('position',)
        unique_together = (('quiz', 'position',), ('quiz', 'question',))

    def __str__(self):
        return str(self.quiz)+'--->'+str(self.question)

    def save(self, *args, **kwargs):
        # auto initialize position, if position is not given
        qs = QuizQuestion.objects.all().filter(quiz=self.quiz.id)
        if self.position and self.position >= 0:
            pass
        else:
            self.position = len(qs)
        return super().save(*args, **kwargs)
