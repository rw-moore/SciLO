from django.db import connection

def get_responses_grades_by_questionattempt_id(question_attempt_id):
    # rows is a list of (avg, max, min, id, weight)
    with connection.cursor() as cursor:
        cursor.execute( '''
        WITH response(id, weight) AS (
        SELECT r.id as id, r.weight as weight
        FROM polls_response as r, polls_questionattempt as qa
        WHERE qa.id = %s AND qa.question_id = r.question_id
        )
        SELECT AVG(ra.grade), MAX(ra.grade), MIN(ra.grade), response.id, response.weight
        FROM response, polls_responseattempt as ra
        WHERE response.id = ra.response_id AND ra.question_attempt_id = %s
        ORDER BY response.id ASC;
        ''', [question_attempt_id, question_attempt_id])
        rows = cursor.fetchall()
    return rows

