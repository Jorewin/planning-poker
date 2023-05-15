from django.db import models


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

    players_number = models.IntegerField()
    ready_players_number = models.IntegerField()


class Player(models.Model):
    session = models.ForeignKey(Session, models.SET_NULL, null=True)
    selection = models.SmallIntegerField(null=True)
