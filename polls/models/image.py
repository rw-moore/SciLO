import hashlib
import os

from django.core.files.storage import FileSystemStorage
from django.db import models

class ImageManager(models.Manager):
    def with_active(self):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM polls_image
                WHERE polls_image.id NOT IN (
                SELECT DISTINCT qt.image_id
                FROM polls_question_tags qt
                )""")
            cursor.execute("""
                WITH qt(id) AS(
                SELECT DISTINCT qt.image_id
                FROM polls_question_tags qt
                )
                SELECT t.id, t.name
                FROM polls_image t, qt
                WHERE t.id = qt.id
                ORDER BY t.name ASC""")
            result_list = []
            for row in cursor.fetchall():
                t = self.model(id=row[0], name=row[1])
                result_list.append(t)
        return result_list

class MediaFileSystemStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        if max_length and len(name) > max_length:
            raise Exception("name's length is greater than max_length")
        return name

    def _save(self, name, content):
        if self.exists(name):
            # if the file exists, do not call the superclasses _save method
            return name
        # if the file is new, DO call it
        return super(MediaFileSystemStorage, self)._save(name, content)


def media_file_name(instance, filename):
    h = instance.md5sum
    _basename, ext = os.path.splitext(filename)
    return os.path.join('storage/images', h[0:1], h[1:2], h + ext.lower())


class Image(models.Model):
    # use the custom storage class fo the FileField
    orig_file = models.FileField(
        upload_to=media_file_name, storage=MediaFileSystemStorage())
    md5sum = models.CharField(max_length=36)
    # ...

    def save(self, *args, **kwargs):
        if not self.pk:  # file is new
            md5 = hashlib.md5()
            for chunk in self.orig_file.chunks():
                md5.update(chunk)
            self.md5sum = md5.hexdigest()
        super(Image, self).save(*args, **kwargs)
