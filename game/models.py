from django.db import models

# Create your models here.
class MatchResult(models.Model):
    strategy1 = models.CharField(max_length=50)
    strategy2 = models.CharField(max_length=50)
    score1 = models.IntegerField()
    score2 = models.IntegerField()
    rounds = models.IntegerField()
    noise = models.FloatField(default=0)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.strategy1} vs {self.strategy2}"