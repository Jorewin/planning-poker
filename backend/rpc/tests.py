from copy import deepcopy
from functools import wraps

from django.test import LiveServerTestCase

from xmlrpc.client import Fault, Transport, ServerProxy, INTERNAL_ERROR

from .types import PlayerSelectionDTO, SessionDTO


class CookiesTransport(Transport):
    """A Transport (HTTP) subclass that retains cookies over its lifetime."""
    def __init__(self):
        super().__init__()
        self._cookies = []

    def send_headers(self, connection, headers):
        if self._cookies:
            connection.putheader("Cookie", "; ".join(self._cookies))
        super().send_headers(connection, headers)

    def parse_response(self, response):
        if response.msg.get_all("Set-Cookie"):
            for header in response.msg.get_all("Set-Cookie"):
                cookie = header.split(";", 1)[0]
                self._cookies.append(cookie)
        return super().parse_response(response)


class ServerProxyPool:
    @wraps(ServerProxy.__init__, assigned=("__doc__", "__annotations__"), updated=("__dict__",))
    def __init__(self, *args, **kwargs):
        self._client_storage = {}
        self._server_proxy_args = args
        self._server_proxy_kwargs = kwargs

    def __getitem__(self, item: int) -> ServerProxy:
        if self._client_storage.get(item) is None:
            self._client_storage[item] = ServerProxy(*deepcopy(self._server_proxy_args), **deepcopy(self._server_proxy_kwargs))

        return self._client_storage[item]


class RPCTestCase(LiveServerTestCase):
    def setUp(self) -> None:
        self.clients = ServerProxyPool(f"{self.live_server_url}/", transport=CookiesTransport())

    def tearDown(self) -> None:
        del self.clients

    def test_user_was_created(self):
        # when
        self.clients[1].register("username", "")

    def test_user_was_not_created_already_logged_in(self):
        # given
        username = "username"
        self.clients[1].register(username, "")

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].register(username, "")

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_user_was_not_created_with_the_same_username(self):
        # given
        username = "username"
        self.clients[1].register(username, "")

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[2].register(username, "")

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_user_was_logged_in(self):
        # given
        username = "username"
        self.clients[1].register(username, "")
        self.clients[1].logout()

        # when
        self.clients[1].login(username, "")

    def test_user_was_not_logged_in_already_logged_in(self):
        # given
        username = "username"
        self.clients[1].register(username, "")

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].login(username, "")

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_user_was_logged_out(self):
        # given
        self.clients[1].register("username", "")

        # when
        self.clients[1].logout()

    def test_session_was_created(self):
        # given
        self.clients[1].register("username", "")

        # when
        session_id = self.clients[1].create_session()

        # then
        self.assertIsInstance(session_id, int)

    def test_auto_joined_returned_session(self):
        # given
        username = "username"
        player_session_dto: PlayerSelectionDTO = {"username": username}

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()
        returned_player_selection_dtos: list[PlayerSelectionDTO] = self.clients[1].get_selections(returned_session_id)

        # then
        self.assertIsInstance(returned_player_selection_dtos, list)
        self.assertIn(player_session_dto, returned_player_selection_dtos)

    def test_user_is_owner_of_returned_session(self):
        # given
        username = "username"

        self.clients[1].register(username, "")
        returned_session_id = self.clients[1].create_session()
        returned_session_dto = self.clients[1].get_session(returned_session_id)

        # then
        self.assertIsInstance(returned_session_dto, dict)
        self.assertIsInstance(returned_session_dto.get("user_is_owner"), bool)
        self.assertTrue(returned_session_dto.get("user_is_owner"))

    def test_session_was_joined(self):
        # given
        first_username = "first_username"
        second_username = "second_username"
        second_player_selection_dto: PlayerSelectionDTO = {"username": second_username}

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[2].join_session(returned_session_id)
        returned_player_selection_dtos: list[PlayerSelectionDTO] = self.clients[2].get_selections(returned_session_id)

        # then
        self.assertIn(second_player_selection_dto, returned_player_selection_dtos)

    def test_returned_sessions_match(self):
        # given
        first_username = "first_username"
        second_username = "second_username"

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        first_returned_session_id: int = self.clients[1].create_session()
        second_returned_session_id: int = self.clients[2].create_session()
        self.clients[2].join_session(first_returned_session_id)
        session_details_dtos: list[SessionDTO] = [
            {"id": first_returned_session_id, "user_is_owner": False},
            {"id": second_returned_session_id, "user_is_owner": True}
        ]

        # when
        returned_session_dtos: list[SessionDTO] = sorted(self.clients[2].get_sessions(), key=lambda key: key.get("id"))

        # then
        self.assertEqual(session_details_dtos, returned_session_dtos)

    def test_session_was_left(self):
        # given
        first_username = "first_username"
        second_username = "second_username"
        second_player_selection_dto: PlayerSelectionDTO = {"username": second_username}

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[2].join_session(returned_session_id)

        # when
        self.clients[2].leave_session(returned_session_id)

        # then
        returned_player_selection_dtos: list[PlayerSelectionDTO] = self.clients[1].get_selections(returned_session_id)
        self.assertNotIn(second_player_selection_dto, returned_player_selection_dtos)

    def test_session_was_deleted_after_owner_left(self):
        # given
        username = "username"

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        self.clients[1].leave_session(returned_session_id)
        with self.assertRaises(Fault) as cm:
            self.clients[1].get_session(returned_session_id)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_selection_was_made(self):
        # given
        selection = 1
        username = "username"

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        self.clients[1].make_selection(returned_session_id, selection)

        # then
        returned_selection = self.clients[1].get_selection(returned_session_id)
        self.assertEqual(selection, returned_selection)

    def test_cant_make_selection_when_not_in_session(self):
        # given
        selection = 1
        first_username = "first_username"
        second_username = "second_username"

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[2].make_selection(returned_session_id, selection)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_cant_make_selection_when_selection_was_made(self):
        # given
        selection = 1
        username = "username"

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[1].make_selection(returned_session_id, selection)

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].make_selection(returned_session_id, selection)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_selection_was_reset(self):
        # given
        username = "username"
        selection = 5

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[1].make_selection(returned_session_id, selection)

        # when
        returned_selection = self.clients[1].reset_selection(returned_session_id)

        # then
        self.assertEqual(returned_selection, None)

    def test_cant_reset_selection_when_not_in_session(self):
        # given
        first_username = "first_username"
        second_username = "second_username"

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[2].reset_selection(returned_session_id)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_cant_reset_selection_when_no_selection(self):
        # given
        username = "username"

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].reset_selection(returned_session_id)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_get_selections_with_one_player(self):
        # given
        selection = 1
        username = "username"
        player_selection_dtos: list[PlayerSelectionDTO] = [{"username": username, "selection": selection}]

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[1].make_selection(returned_session_id, selection)

        # when
        returned_player_selection_dtos: list[PlayerSelectionDTO] = self.clients[1].get_selections(returned_session_id)

        # then
        self.assertEqual(player_selection_dtos, returned_player_selection_dtos)

    def test_returned_selections_after_force_selection(self):
        # given
        selection = 1
        username = "username"
        player_selection_dtos: list[PlayerSelectionDTO] = [{"username": username, "selection": None}]

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[1].force_selections(returned_session_id)

        # when
        returned_player_selection_dtos: list[PlayerSelectionDTO] = self.clients[1].get_selections(returned_session_id)

        # then
        self.assertEqual(player_selection_dtos, returned_player_selection_dtos)

    def test_get_selections_with_two_players(self):
        # given
        first_selection = 1
        second_selection = 2
        first_username = "first_username"
        second_username = "second_username"
        player_selection_dtos: list[PlayerSelectionDTO] = [
            {"username": first_username, "selection": first_selection},
            {"username": second_username, "selection": second_selection}
        ]

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[2].join_session(returned_session_id)
        self.clients[1].make_selection(returned_session_id, first_selection)
        self.clients[2].make_selection(returned_session_id, second_selection)

        # when
        returned_player_selection_dtos: list[PlayerSelectionDTO] = \
            sorted(self.clients[1].get_selections(returned_session_id), key=lambda key: key.get("selection"))

        # then
        self.assertEqual(player_selection_dtos, returned_player_selection_dtos)

    def test_returned_selections_are_the_same(self):
        # given
        first_selection = 1
        second_selection = 2
        first_username = "first_username"
        second_username = "second_username"

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[2].join_session(returned_session_id)
        self.clients[1].make_selection(returned_session_id, first_selection)
        self.clients[2].make_selection(returned_session_id, second_selection)

        # when
        first_returned_player_selection_dtos: list[PlayerSelectionDTO] = \
            self.clients[1].get_selections(returned_session_id)

        second_returned_player_selection_dtos: list[PlayerSelectionDTO] = \
            self.clients[2].get_selections(returned_session_id)

        # then
        self.assertEqual(first_returned_player_selection_dtos, second_returned_player_selection_dtos)

    def test_returned_selections_are_empty_when_no_selection(self):
        # given
        selection = 1
        username = "username"

        self.clients[1].register(username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        returned_player_selection_dtos: list[PlayerSelectionDTO] = self.clients[1].get_selections(returned_session_id)

        # then
        for dto in returned_player_selection_dtos:
            self.assertIsNone(dto.get("selection"))


    def test_cant_get_selections_when_not_in_session(self):
        # given
        first_username = "first_username"
        second_username = "second_username"

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[2].get_selections(returned_session_id)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)

    def test_cant_force_selections_when_not_an_owner(self):
        # given
        first_username = "first_username"
        second_username = "second_username"

        self.clients[1].register(first_username, "")
        self.clients[2].register(second_username, "")
        returned_session_id: int = self.clients[1].create_session()
        self.clients[2].join_session(returned_session_id)

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[2].force_selections(returned_session_id)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
