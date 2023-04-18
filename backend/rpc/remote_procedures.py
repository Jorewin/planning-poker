from functools import wraps
from typing import Callable, Concatenate, ParamSpec, TypeVar

from django.http import HttpRequest

from modernrpc.core import rpc_method, REQUEST_KEY
from .models import Player, Session


P = ParamSpec('P')
R = TypeVar('R')


def register_player(func: Callable[Concatenate[int, HttpRequest, P], R]) -> Callable[Concatenate[HttpRequest, P], R]:
    """Registers a player based on its browser session and passes the `player_id` to the decorated function.
    Works as a middleware between the `rpc_method` and the function its decorating.
    """

    @wraps(func)
    def register_player_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        request = kwargs[REQUEST_KEY]

        if request.session.get("player_id") is None:
            player = Player()
            player.save()
            request.session["player_id"] = player.id

        return func(request.session["player_id"], *args, **kwargs)

    return register_player_wrapper


@rpc_method
@register_player
def create_session(player_id: int, **_) -> int:
    """Creates a planning poker session and adds the current player to it.

    :param player_id: current player's id
    :return: identifier of the created session
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is not None:
        raise Exception()

    session = Session(players_number=1, ready_players_number=0)
    session.save()
    player.session = session
    player.save()

    return session.id


@rpc_method
@register_player
def join_session(player_id: int, session_id: int, **_):
    """Joins the current player to an existing session.

    :param player_id: current player's id
    :param session_id: identifier of the session the player want to join
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)
    session = Session.objects.get(id=session_id)

    if player.session is not None:
        raise Exception()

    player.session = session
    player.save()
    session.players_number += 1
    session.save()


@rpc_method
@register_player
def get_session(player_id: int, **_) -> int | None:
    """Gets the current player's session identifier.

    :param player_id: current player's id
    :return: identifier of the current user's session
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is None:
        return None
    else:
        return player.session.id


@rpc_method
@register_player
def leave_session(player_id: int, **_):
    """Removes the current player from their session and wipes their selection.

    :param player_id: current player's id
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is None:
        raise Exception()

    session = player.session
    session.players_number -= 1

    if player.selection is not None:
        session.ready_players_number -= 1

    session.save()
    player.session = None
    player.selection = None
    player.save()

    if session.players_number == 0:
        session.delete()


@rpc_method
@register_player
def make_selection(player_id: int, selection: int, **_):
    """Sets player's selection to `selection`.

    :param player_id: current player's id
    :param selection: a new selection value
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is None or player.selection is not None:
        raise Exception()

    player.selection = selection
    player.save()
    session = player.session
    session.ready_players_number += 1
    session.save()


@rpc_method
@register_player
def get_selection(player_id: int, **_) -> int | None:
    """Gets current player's selection.

    :param player_id: current player's id
    :return: current player's selection
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is None:
        raise Exception()

    return player.selection


@rpc_method
@register_player
def reset_selection(player_id: int, **_):
    """Sets player's selection to nothing.

    :param player_id: current player's id
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is None or player.selection is None:
        raise Exception()

    player.selection = None
    player.save()
    session = player.session
    session.ready_players_number -= 1
    session.save()


@rpc_method
@register_player
def get_selections(player_id: int, **_) -> list[int] | None:
    """Gets all selections in this player's session if every player is ready.

    :param player_id: current player's id
    :return: list of all selections
    :raise Any: any error that occurs inside
    """
    player = Player.objects.get(id=player_id)

    if player.session is None:
        raise Exception()

    session = player.session

    if session.ready_players_number != session.players_number:
        return None

    players = session.player_set.all()
    selections = [x.selection for x in players]

    return selections
