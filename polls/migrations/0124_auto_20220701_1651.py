# Generated by Django 3.0.8 on 2022-07-01 16:51

from django.db import migrations
def move_patterns(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Responses = apps.get_model("polls", "Response")
    for resp in Responses.objects.using(db_alias).all():
        resp.rtype['patterntype'] = resp.patterntype
        resp.rtype['pattern'] = resp.pattern
        resp.rtype['patternflag'] = resp.patternflag
        resp.rtype['patternfeedback'] = resp.patternfeedback
        resp.rtype['correct'] = resp.correct
        resp.save()


def reverse_move_patterns(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Responses = apps.get_model("polls", "Response")
    for resp in Responses.objects.using(db_alias).all():
        resp.patterntype = resp.rtype.pop('patterntype')
        resp.pattern = resp.rtype.pop('pattern')
        resp.patternflag = resp.rtype.pop('patternflag')
        resp.patternfeedback = resp.rtype.pop('patternfeedback')
        resp.correct = resp.rtype.pop('correct')
        resp.save()

class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0123_question_options'),
    ]

    operations = [
        migrations.RunPython(move_patterns, reverse_move_patterns),
        migrations.RemoveField(model_name='response', name='patterntype'),
        migrations.RemoveField(model_name='response', name='pattern'),
        migrations.RemoveField(model_name='response', name='patternflag'),
        migrations.RemoveField(model_name='response', name='patternfeedback'),
        migrations.RemoveField(model_name='response', name='correct'),

    ]
