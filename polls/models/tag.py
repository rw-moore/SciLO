from django.db import models


class TagManager(models.Manager):
    def with_active(self):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH qt(id) AS(
                SELECT DISTINCT qt.tag_id
                FROM polls_question_tags qt
                )
                SELECT t.id, t.name
                FROM polls_tag t, qt
                WHERE t.id = qt.id
                ORDER BY t.name ASC""")
            result_list = []
            for row in cursor.fetchall():
                t = self.model(id=row[0], name=row[1])
                result_list.append(t)
        return result_list


class Tag(models.Model):
    '''
    name: the name of tag
    '''

    class Meta:
        app_label = 'polls'

    name = models.CharField(unique=True, max_length=20, null=False, blank=False)
    objects = TagManager()

    def __str__(self):
        return self.name
