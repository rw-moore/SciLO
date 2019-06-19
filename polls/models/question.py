from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField
from psycopg2.extensions import AsIs
from .user import User
from .variable import VariableField


class QuestionManager(models.Manager):

    def _question_query_quiz(self, quizzs):
        if quizzs:
            query = ' AND ('
            for quiz in quizzs[:-1]:
                query += 'pqq.quiz_id = {} OR '.format(quiz)
            query += 'pqq.quiz_id = {})'.format(quizzs[-1])
            return query
        else:
            return ''

    def _question_query_author(self, author):
        if author:
            return ' AND pq.author_id = '+str(author)
        else:
            return ''

    def _question_query_tag(self, tags):
        if tags:
            query = ' AND ('
            for tag in tags[:-1]:
                query += ' pqt.tag_id = {} OR'.format(tag)
            query += ' pqt.tag_id = {})'.format(tags[-1])
            return query
        else:
            return ''

    def _having_clause(self, quiz_query, tag_query, source):
        having_query = ''
        if quiz_query:
            if having_query:
                having_query += ' COUNT(DISTINCT pqq.quiz_id) = ' + str(len(source.get('quiz')))
            else:
                having_query = 'HAVING COUNT(DISTINCT pqq.quiz_id) = ' + str(len(source.get('quiz')))
        if tag_query:
            if having_query:
                having_query += ' AND COUNT(DISTINCT pqt.tag_id) = ' + str(len(source.get('tag')))
            else:
                having_query = 'HAVING COUNT(DISTINCT pqt.tag_id) = ' + str(len(source.get('tag')))
        return having_query

    def with_query(self, **kwargs):
        results = kwargs.get('results', None)
        page = kwargs.get('page', None)
        sort = kwargs.get('sort', 'id')
        sort = 'q.'+sort
        order = kwargs.get('order', 'ASC')
        if results and page:
            questions_range = int(results)*(int(page)-1), int(results)*(int(page))
        else:
            questions_range = None
        quiz_query = self._question_query_quiz(kwargs.get('quiz', None))
        author_query = self._question_query_quiz(kwargs.get('author', None))
        tag_query = self._question_query_tag(kwargs.get('tag', None))
        having_query = self._having_clause(quiz_query, tag_query, kwargs)

        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH q(id,create_date,last_modify_date,title,author_id,response) AS (
                SELECT pq.id, pq.create_date, pq.last_modify_date, pq.title, pq.author_id, COUNT(pq.id) as response
                FROM polls_question pq, polls_response pr
                WHERE pr.question_id = pq.id
                GROUP BY pq.id
                )
                SELECT DISTINCT(q.id)
                FROM q
                LEFT JOIN polls_quizquestion pqq ON pqq.question_id=q.id
                LEFT JOIN polls_question_tags pqt ON pqt.question_id=q.id
                WHERE true {} {} {}
                GROUP BY q.id
                {}
                ORDER BY %s %s;""".format(quiz_query, author_query, tag_query, having_query),
                           [AsIs(sort), AsIs(order)])

            result_list = []
            for index, row in enumerate(cursor.fetchall()):
                if questions_range:
                    if index+1 < questions_range[1] and index+1 >= questions_range[0]:
                        question = self.model(id=row[0])
                        result_list.append(question)
                else:
                    question = self.model(id=row[0])
                    result_list.append(question)
        return result_list


class Question(models.Model):
    '''
    this class is to represent a question, a question should contains
    at least one response (Reponse Object), and relative answers
    (Answer Object)

    title: string, question title, max size is 200, example: "derivate
    problem"

    background: string, question background information

    weight: int, the total weight in question, example: 100

    create_date: Date

    last_modify_date: Date

    author: User, user who creates this question

    tag: Tag, the tag this question has

    quizzes: [Quiz], the quizzes contains this question

    responses: [Response], the reponses contains in this question

    variables: [Variable]

    '''

    class Meta:
        app_label = 'polls'

    title = models.CharField(max_length=200)
    text = models.TextField(blank=True)
    create_date = models.DateTimeField(default=timezone.now)
    last_modify_date = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    tags = models.ManyToManyField('Tag')
    quizzes = models.ManyToManyField('Quiz', through='QuizQuestion')
    variables = ArrayField(VariableField(), default=list, blank=True)
    objects = QuestionManager()

    def __str__(self):
        return super().__str__()+' title: '+str(self.title)


class QuestionAttempt(models.Model):
    '''
    grade: the current grade

    question: Question, a question this question attempt belongs to

    author: User, who write this attempt

    quiz_attemp: QuizAttempt, a quiz attempt this question attempt
    belongs to

    response_attempts: [ResponseAttempt], each reponses in question has a
    response attempt


    '''
    class Meta:
        app_label = 'polls'

    grade = models.FloatField(default=0)

    quiz_attempt = models.ForeignKey('QuizAttempt', on_delete=models.CASCADE,
                                     related_name="question_attempts",
                                     blank=True, null=True)
    question = models.ForeignKey("Question", on_delete=models.CASCADE,
                                 related_name="question_attempts")

    def get_response_attempts(self, **kwargs):
        return self.response_attempts.filter(**kwargs)
