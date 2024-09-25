from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=100)
    IDname = models.IntegerField()
    Location = models.CharField(max_length=10)
    Shift_Start_Date = models.DateField()
    Shift_Start_Time = models.TimeField()
    Shift_End_Time = models.TimeField()
    Shift_End_Date = models.DateField()

    def __str__(self):
        return self.name