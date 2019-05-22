
from django.db import models
from django.utils import timezone
from .user import User
from .question import Question, QuestionAttempt


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
    description = models.TextField(default='')
    weight = models.PositiveSmallIntegerField(default=100)
    bonus = models.PositiveSmallIntegerField(default=0)

    create_date = models.DateTimeField(default=timezone.now)
    last_modify_date = models.DateTimeField(default=timezone.now)

    author = models.ForeignKey(User, on_delete=models.CASCADE,
                               blank=True, null=True)
    category = models.ForeignKey('Tag', related_name='quizzes',
                                 on_delete=models.SET_NULL, null=True, blank=True)

    questions = models.ManyToManyField(Question,
                                       through='QuizQuestion')

    def __str__(self):
        return super().__str__()+' title: '+str(self.title)

    def clear_quiz_question_links(self, question_id=None):
        if self.pk:
            if question_id is None:
                QuizQuestion.objects.filter(quiz=self.pk).delete()
            else:
                QuizQuestion.objects.filter(quiz=self.pk, question=question_id).delete()

    def set_quiz_question_links(self, questions_id=None):
        if questions_id is None:
            questions_id = []
        from polls.serializers import QuizQuestionSerializer
        if self.pk:
            quizquestion = [{'question': question_id, 'quiz': self.pk} for question_id in questions_id]
            serializer = QuizQuestionSerializer(data=quizquestion, many=True)
            if serializer.is_valid():
                serializer.save()
            else:
                raise Exception(serializer.errors)

    def update_quiz_question_links(self, questions_id=None):
        if questions_id is None:
            questions_id = []
        self.clear_quiz_question_links()
        self.set_quiz_question_links(questions_id)


class QuizAttempt(models.Model):
    '''

    grade: Float, current grade

    quiz: Quiz, a quiz contains this quiz attempt

    question_attemps: [QuestionAttempt], each question in quiz has a
    question attempt

    author: User, user who writes this quiz attempt
    '''

    class Meta:
        app_label = 'polls'

    grade = models.FloatField(default=0)

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def save(self, *args, **kwargs):
        # creating quiz-attempt will auto-create question-attempt base on the QuizQuestion table
        # and question-attempt will NOT auto-create response-attempt
        # creating response-attempt means submitting response answer
        super().save(*args, **kwargs)
        quiz_questions = QuizQuestion.objects.filter(quiz=self.quiz)
        for links in quiz_questions:
            question = links.question
            QuestionAttempt.objects.create(quiz_attempt=self, question=question)


class QuizQuestion(models.Model):
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE, related_name='quizlinkback')
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
