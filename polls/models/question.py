from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField, JSONField
from psycopg2.extensions import AsIs
from .user import User
from .variable import VariableField


class QuestionManager(models.Manager):

    def _question_query_quizzes(self, quizzes):
        if quizzes:
            query = ' AND ('
            for quiz in quizzes[:-1]:
                query += 'pqq.quiz_id = {} OR '.format(quiz)
            query += 'pqq.quiz_id = {})'.format(quizzes[-1])
            return query
        else:
            return ''

    def _question_query_author(self, authors):
        query = ''
        if authors and len(authors) > 0:
            query += ' AND ( author_id = {} '.format(authors[0])
            for author in authors[1:]:
                query += ' OR author_id = {} '.format(author)
            query += ')'
        return query

    def _question_query_tags(self, tags):
        if tags:
            query = ' AND ('
            for tag in tags[:-1]:
                query += ' pqt.tag_id = {} OR'.format(tag)
            query += ' pqt.tag_id = {})'.format(tags[-1])
            return query
        else:
            return ''

    def _having_clause(self, quizzes_query, tags_query, source):
        having_query = ''
        if quizzes_query:
            if having_query:
                having_query += ' COUNT(DISTINCT pqq.quiz_id) = ' + str(len(source.get('quizzes')))
            else:
                having_query = 'HAVING COUNT(DISTINCT pqq.quiz_id) = ' + str(len(source.get('quizzes[]')))
        if tags_query:
            if having_query:
                having_query += ' AND COUNT(DISTINCT pqt.tag_id) = ' + str(len(source.get('tags[]')))
            else:
                having_query = 'HAVING COUNT(DISTINCT pqt.tag_id) = ' + str(len(source.get('tags[]')))
        return having_query

    def _course_query(self, courses):
        where_condition = ''
        if courses and len(courses) > 0:
            if courses[0] == '-1':
                return 'AND (course_id IS NULL)'
            where_condition += ' AND( course_id = {}'.format(courses[0])
            for i in range(1, len(courses)):
                where_condition += 'OR course_id = {}'.format(courses[i])
                if courses[i] == '-1':
                    return 'AND (course_id IS NULL)'
            where_condition += ')'
        return where_condition

    def with_query(self, **kwargs):
        results = kwargs.get('results', [None])[0]
        page = kwargs.get('page', [None])[0]
        sort = kwargs.get('sortField', ['id'])
        sort = 'q.'+sort[0]
        order = kwargs.get('sortOrder', ['ASC'])[0]

        if order == 'ascend':
            order = 'ASC'
        elif order == 'descend':
            order = 'DESC'

        if results and page:
            questions_range = int(results)*(int(page)-1), int(results)*(int(page))
        else:
            questions_range = None

        course_condition = self._course_query(kwargs.get('courses[]', None))
        quizzes_query = self._question_query_quizzes(kwargs.get('quizzes[]', None))
        author_condition = self._question_query_author(kwargs.get('authors[]', None))
        tags_query = self._question_query_tags(kwargs.get('tags[]', None))
        having_query = self._having_clause(quizzes_query, tags_query, kwargs)

        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH q(id,last_modify_date,title,author_id,responses) AS (
                SELECT pq.id, pq.last_modify_date, pq.title, pq.author_id, COUNT(pr.id) AS responses
                FROM polls_question pq LEFT JOIN polls_response pr ON pr.question_id = pq.id
                WHERE true {} {}
                GROUP BY pq.id
                )
                SELECT  q.id
                FROM q
                LEFT JOIN polls_quizquestion pqq ON pqq.question_id=q.id
                LEFT JOIN polls_question_tags pqt ON pqt.question_id=q.id
                WHERE true {} {}
                GROUP BY q.id, %s
                {}
                ORDER BY %s %s
                ;""".format(course_condition, author_condition, quizzes_query, tags_query, having_query),
                           [AsIs(sort), AsIs(sort), AsIs(order)])

            result_list = []
            length = 0
            for index, row in enumerate(cursor.fetchall()):
                if questions_range:
                    if index+1 <= questions_range[1] and index+1 > questions_range[0]:
                        question = self.model.objects.get(pk=row[0])
                        result_list.append(question)
                else:
                    question = self.model.objects.get(id=row[0])
                    result_list.append(question)
                length += 1
        return result_list, length


def default_para_dict():
    return {"type": "", "data": ""}


class Question(models.Model):
    '''
    this class is to represent a question, a question should contains
    at least one response (Reponse Object), and relative answers
    (Answer Object)

    title: string, question title, max size is 200, example: "derivate
    problem"

    background: string, question background information

    weight: int, the total weight in question, example: 100

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
    text = models.TextField(blank=True, default='')
    last_modify_date = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    course = models.ForeignKey('Course', on_delete=models.CASCADE, blank=True, null=True, related_name='questions')
    tags = models.ManyToManyField('Tag')
    quizzes = models.ManyToManyField('Quiz', through='QuizQuestion')
    variables = ArrayField(VariableField(), default=list, blank=True)
    objects = QuestionManager()

    def __str__(self):
        return super().__str__()+' title: '+str(self.title)
