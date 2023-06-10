from copy import deepcopy
from functools import wraps
from typing import Any

from django.test import LiveServerTestCase

from xmlrpc.client import Fault, Transport, ServerProxy, INTERNAL_ERROR

from .dto import PlayerSelectionDTO


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

    def assumeIsNone(self, obj: object, msg: str = ""):
        if obj is not None:
            self.skipTest(msg)

    def assumeIsInstance(self, obj: object, cls: type | tuple[type | tuple[Any, ...], ...], msg: str = ""):
        if not isinstance(obj, cls):
            self.skipTest(msg)

    def test_session_was_created(self):
        # given
        self.assumeIsNone(self.clients[1].get_session())

        # when
        session_id = self.clients[1].create_session()

        # then
        self.assertIsInstance(session_id, int)

    def test_auto_joined_created_session(self):
        # given
        created_session_id = self.clients[1].create_session()
        self.assumeIsInstance(created_session_id, int)

        # when
        returned_session_id = self.clients[1].get_session()

        # then
        self.assertEqual(created_session_id, returned_session_id)

    def test_cant_create_session_when_in_session(self):
        # given
        self.clients[1].create_session()
        self.assumeIsInstance(self.clients[1].get_session(), int)

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].create_session()

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_session_was_joined(self):
        # given
        created_session_id = self.clients[1].create_session()
        self.assumeIsInstance(created_session_id, int)
        self.assumeIsNone(self.clients[2].get_session())

        # when
        self.clients[2].join_session(created_session_id)

        # then
        returned_session_id = self.clients[2].get_session()
        self.assertEqual(created_session_id, returned_session_id)

    def test_cant_join_session_when_in_session(self):
        # given
        session_id = self.clients[1].create_session()
        self.clients[2].create_session()
        self.assumeIsInstance(session_id, int)
        self.assumeIsInstance(self.clients[2].get_session(), int)

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[2].join_session(session_id)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_session_was_left(self):
        # given
        self.clients[1].create_session()
        self.assumeIsInstance(self.clients[1].get_session(), int)

        # when
        self.clients[1].leave_session()

        # then
        returned_session_id = self.clients[1].get_session()
        self.assertIsNone(returned_session_id)

    def test_selection_was_reset_after_session_was_left(self):
        # given
        selection = 1
        self.clients[1].create_session()
        self.clients[1].make_selection(selection)
        self.assumeIsInstance(self.clients[1].get_session(), int)
        self.assumeIsInstance(self.clients[1].get_selection(), int)

        # when
        self.clients[1].leave_session()

        # then
        self.clients[1].create_session()
        returned_selection = self.clients[1].get_selection()
        self.assertIsNone(returned_selection)

    def test_cant_leave_session_when_not_in_session(self):
        # given
        self.assumeIsNone(self.clients[1].get_session())

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].leave_session()

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_selection_was_made(self):
        # given
        selection = 1
        self.clients[1].create_session()
        self.assumeIsInstance(self.clients[1].get_session(), int)

        # when
        self.clients[1].make_selection(selection)

        # then
        returned_selection = self.clients[1].get_selection()
        self.assertEqual(selection, returned_selection)

    def test_cant_make_selection_when_not_in_session(self):
        # given
        selection = 1
        self.assumeIsNone(self.clients[1].get_session())

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].make_selection(selection)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_selection_was_reset(self):
        # given
        selection = 1
        self.clients[1].create_session()
        self.clients[1].make_selection(selection)
        self.assumeIsInstance(self.clients[1].get_session(), int)
        self.assumeIsInstance(self.clients[1].get_selection(), int)

        # when
        self.clients[1].reset_selection()

        # then
        returned_selection = self.clients[1].get_selection()
        self.assertIsNone(returned_selection)

    def test_cant_reset_selection_when_not_in_session(self):
        # given
        self.assumeIsNone(self.clients[1].get_session())

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].reset_selection()

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_cant_reset_selection_when_no_selection(self):
        # given
        self.clients[1].create_session()
        self.assumeIsNone(self.clients[1].get_selection())

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].reset_selection()

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_get_selections_with_one_player(self):
        # given
        selection = 1

        self.clients[1].create_session()
        self.clients[1].make_selection(1)
        self.assumeIsInstance(self.clients[1].get_session(), int)
        self.assumeIsInstance(self.clients[1].get_selection(), int)

        # when
        returned_player_selections = self.clients[1].get_selections()

        # then
        self.assertIsInstance(returned_player_selections, list)
        self.assertEqual([selection], [x.get("selection") for x in returned_player_selections])

    def test_get_selections_with_two_players(self):
        # given
        selections = [1, 2]
        session_id = self.clients[1].create_session()
        self.clients[2].join_session(session_id)
        self.clients[1].make_selection(selections[0])
        self.clients[2].make_selection(selections[1])
        self.assumeIsInstance(self.clients[1].get_session(), int)
        self.assumeIsInstance(self.clients[1].get_selection(), int)
        self.assumeIsInstance(self.clients[2].get_selection(), int)

        # when
        returned_player_selections = self.clients[1].get_selections()

        # then
        self.assertIsInstance(returned_player_selections, list)
        self.assertEqual(selections, sorted(x.get("selection") for x in returned_player_selections))

    def test_returned_selections_are_the_same(self):
        # given
        selections = [1, 2]
        session_id = self.clients[1].create_session()
        self.clients[2].join_session(session_id)
        self.clients[1].make_selection(selections[0])
        self.clients[2].make_selection(selections[1])
        self.assumeIsInstance(self.clients[1].get_session(), int)
        self.assumeIsInstance(self.clients[2].get_session(), int)
        self.assumeIsInstance(self.clients[1].get_selection(), int)
        self.assumeIsInstance(self.clients[2].get_selection(), int)

        # when
        returned_player_selections_1 = self.clients[1].get_selections()
        returned_player_selections_2 = self.clients[1].get_selections()

        # then
        self.assertEqual(returned_player_selections_1, returned_player_selections_2)

    def test_returned_selections_are_empty_when_no_selection(self):
        # given
        self.clients[1].create_session()
        self.assumeIsInstance(self.clients[1].get_session(), int)
        self.assumeIsNone(self.clients[1].get_selection())

        # when
        returned_player_selections = self.clients[1].get_selections()

        # then
        for player_selection in returned_player_selections:
            self.assumeIsNone(player_selection.get("selection"))

    def test_cant_get_selections_when_not_in_session(self):
        # given
        self.assumeIsNone(self.clients[1].get_session())

        # when
        with self.assertRaises(Fault) as cm:
            self.clients[1].get_selections()

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")
