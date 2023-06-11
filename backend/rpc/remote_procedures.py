from functools import wraps
from typing import Callable, Concatenate, ParamSpec, TypeVar

from django.http import HttpRequest
from django.contrib.auth.models import User
from django.contrib.auth import authenticate as django_authenticate, login as django_login, logout as django_logout

from modernrpc.core import rpc_method, REQUEST_KEY
from .models import Player, Session
from .types import PlayerSelectionDTO, SessionDTO

P = ParamSpec('P')
R = TypeVar('R')


def authenticated_user_only(func: Callable[Concatenate[HttpRequest, P], R]) -> Callable[Concatenate[HttpRequest, P], R]:
    """Makes it impossible for not authenticated users to access the decorated function.
    """

    @wraps(func)
    def authenticated_user_only_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        request = kwargs[REQUEST_KEY]

        if request.user.is_authenticated is None:
            raise Exception("Not available to anonymous users")

        return func(*args, **kwargs)

    return authenticated_user_only_wrapper


@rpc_method
def register(username: str, password: str, **kwargs):
    """Registers a new user and logs them in.

    :param username: unique username
    :param password: password with no limitations
    :raise Any: any error that occurs inside
    """
    request = kwargs[REQUEST_KEY]

    if request.user.is_authenticated:
        raise Exception("Already logged in")

    user = User.objects.create_user(username, password=password)
    django_login(request, user)


@rpc_method
def login(username: str, password: str, **kwargs):
    """Logs the user in when given correct credentials.

    :param username: user's username
    :param password: user's password
    :raise Any: any error that occurs inside
    """
    request = kwargs[REQUEST_KEY]

    if request.user.is_authenticated:
        raise Exception("Already logged in")

    user = django_authenticate(username=username, password=password)

    if user is None:
        raise Exception("Provided credentials are invalid")

    django_login(request, user)


@rpc_method
@authenticated_user_only
def logout(**kwargs):
    """Logs the user out.

    :raise Any: any error that occurs inside
    """
    request = kwargs[REQUEST_KEY]
    django_logout(request)


@rpc_method
@authenticated_user_only
def create_session(**kwargs) -> int:
    """Creates a planning poker session and adds the current user to it as a player.

    :return: identifier of the created session
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user

    session = Session(owner=User, players_number=1, ready_players_number=0)
    session.save()

    player = Player(user=user, session=session)
    player.save()

    return session.id


@rpc_method
@authenticated_user_only
def get_session(session_id: int, **kwargs) -> SessionDTO:
    """Returns info about the chosen session if users is registered as a player.

    :param session_id: identifier of the session the player want to operate on
    :return: session info object
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    session = Player.objects.get(user=user, session=session_id).session
    return {"id": session.id, "user_is_owner": session.owner == user}


@rpc_method
@authenticated_user_only
def get_sessions(**kwargs) -> list[SessionDTO]:
    """Returns a list of sessions the current user is registered as a player in.

    :return: list of session info objects
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user

    sessions = user.session_set.all()
    return [{"id": x.id, "user_is_owner": x.owner == user} for x in sessions]


@rpc_method
@authenticated_user_only
def join_session(session_id: int, **kwargs):
    """Joins the current user to an existing session as a player.

    :param session_id: identifier of the session the player want to join
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    session = Session.objects.get(id=session_id)
    player = Player(user=user, session=session)
    player.save()
    session.players_number += 1
    session.save()


@rpc_method
@authenticated_user_only
def leave_session(session_id: int, **kwargs):
    """Removes the current user from a chosen session and wipes their selection.
    If the owner leaves the session, the session gets deleted.

    :param session_id: identifies the session to be left
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    session = Session.objects.get(id=session_id)

    if session.owner == user:
        session.delete()
        return

    player = Player.objects.get(user=user, session=session)

    if player.voted:
        session.ready_players_number -= 1

    session.players_number -= 1
    session.save()


@rpc_method
@authenticated_user_only
def make_selection(session_id: int, selection: int, **kwargs):
    """Sets current user's selection in a chosen session to `selection` if they haven't voted.

    :param session_id: identifies the session to operate on
    :param selection: new selection value
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    player = Player.objects.get(user=user, session=session_id)
    session = player.session

    if player.selection is not None:
        raise Exception("Selection is not empty")

    player.selection = selection

    if not player.voted:
        session.ready_players_number += 1
        player.voted = True

    player.save()
    session.save()


@rpc_method
@authenticated_user_only
def force_selections(session_id: int, **kwargs):
    """Makes it so that everyone in the chosen session is considered to have voted,
    only if the current user is the owner of the session.

    :param session_id: identifies the session to operate on
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    session = Session.objects.get(id=session_id, owner=user)
    players = session.player_set

    session.ready_players_number = session.players_number
    session.save()

    for player in players:
        if not player.voted:
            player.voted = True
            player.save()


@rpc_method
@authenticated_user_only
def get_selection(session_id: int, **kwargs) -> int | None:
    """Gets current user's selection from chosen session.

    :param session_id: identifies the session to operate on
    :return: current user's selection
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    player = Player.objects.get(user=user, session=session_id)

    return player.selection


@rpc_method
@authenticated_user_only
def reset_selection(session_id: int, **kwargs):
    """Sets current user's selection in a chosen session to nothing if a selection was made before.

    :param session_id: identifies the session to operate on
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    player = Player.objects.get(user=user, session=session_id)

    if player.selection is None:
        raise Exception("Selection is empty")

    player.selection = None
    player.voted = False
    player.save()
    session = player.session
    session.ready_players_number -= 1
    session.save()


@rpc_method
@authenticated_user_only
def get_selections(session_id: int, **kwargs) -> list[PlayerSelectionDTO]:
    """Returns the list of players in a chosen session and their selections if every player is ready.

    :param session_id: identifies the session to operate on
    :return: list of player names and optionally selections
    :raise Any: any error that occurs inside
    """
    user: User = kwargs[REQUEST_KEY].user
    Player.objects.get(user=user, session=session_id)
    session = Session.objects.get(id=session_id)

    players = session.player_set.all()

    if session.ready_players_number != session.players_number:
        return [{"username": x.user.username} for x in players]

    return [{"username": x.user.username, "selection": x.selection} for x in players]
