from django.db import models
from django.contrib.auth.models import User


class Session(models.Model):
    class Meta:
        constraints = [
            models.CheckConstraint(name="ready_players_lte_players",
                                   check=models.Q(ready_players_number__lte=models.F("players_number"))),
            models.CheckConstraint(name="ready_players_gte_zero",
                                   check=models.Q(ready_players_number__gte=0)),
            models.CheckConstraint(name="players_gte_zero",
                                   check=models.Q(players_number__gte=0))
        ]

    owner = models.ForeignKey(User, models.CASCADE)
    players_number = models.IntegerField()
    ready_players_number = models.IntegerField()


class Player(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    session = models.ForeignKey(Session, models.CASCADE)
    selection = models.SmallIntegerField(null=True)
    voted = models.BooleanField(default=False)


class Story(models.Model):
    session = models.ForeignKey(Session, models.CASCADE)
    summary = models.TextField()
    description = models.TextField()


class Task(models.Model):
    story = models.ForeignKey(Story, models.CASCADE)
    summary = models.TextField()
    estimation = models.SmallIntegerField(null=True)
