from django.db import models

class QuestionImage(models.Model):
    image = models.ForeignKey("Image", related_name="question_image", on_delete=models.PROTECT)
    question = models.ForeignKey("Question", related_name="question_image", on_delete=models.CASCADE)
    index = models.IntegerField(null=False, blank=False)

    def __str__(self):
        return 'q_image: '+str(self.question)+' index: '+str(self.index)
