from django.db import models
from jsonfield import JSONField

# Create your models here.
class Case(models.Model):
    class Meta: 
        ordering = ['-date_uploaded']

    csv_file = models.FileField(upload_to="csv-files")
    start_date = models.DateField(blank=True, null=True, default=None)
    skips = JSONField(null=True)
    date_uploaded = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return str(self.date_uploaded)