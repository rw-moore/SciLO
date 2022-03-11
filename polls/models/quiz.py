
from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import JSONField
from .course import Course
from .question import Question
# from .user import UserProfile

def default_review_options():
    return {
        "during": {
            "attempt": True,
            "correct": True,
            "marks": True,
            "feedback": False,
            "solution": False
        # }, "after": {
        #     "attempt": False,
        #     "correct": True,
        #     "marks": True,
        #     "feedback": False,
        #     "solution": False
        }, "later": {
            "attempt": False,
            "correct": True,
            "marks": True,
            "feedback": False,
            "solution": False
        }, "closed": {
            "attempt": False,
            "correct": True,
            "marks": True,
            "feedback": True,
            "solution": False
        }
    }

class Quiz(models.Model):
    '''
    this class is to represent a quiz

    title: string, max length 200

    author: string, str(user) who creates this quiz

    bonus: int, the quiz's bonus mark, example: 20

    last_modify_date: Date the quiz was last edited

    start_date: Date the quiz is scheduled to begin

    end_date: Date the quiz is scheduled to end

    course: Course the quiz belongs to

    late_time: Date the quiz becomes late to submit

    show_solution_date: Date to reveal solutions

    questions: [Question], the questions that this quiz has

    options: JSON of settings and policy overrides for the quiz

    '''
    class Meta:
        app_label = 'polls'
        permissions = [
            ('view_gradebook', 'Can view the gradebook')
        ]

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200, null=True, blank=True)
    bonus = models.PositiveSmallIntegerField(default=0, null=True, blank=True)
    last_modify_date = models.DateTimeField(default=timezone.now)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True, related_name='quizzes')
    late_time = models.DateTimeField(null=True, blank=True)
    questions = models.ManyToManyField(Question, through='QuizQuestion')
    review_options = JSONField(default=default_review_options)
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
