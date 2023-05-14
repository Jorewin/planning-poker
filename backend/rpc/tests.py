from django.test import LiveServerTestCase
from xmlrpc.client import Fault, Transport, ServerProxy, INTERNAL_ERROR


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


class RPCTestCase(LiveServerTestCase):
    def test_session_was_created(self):
        # given
        client = ServerProxy(f"{self.live_server_url}/", transport=CookiesTransport())

        # when
        session_id = client.create_session()

        # then
        self.assertIsInstance(session_id, int)

    def test_session_id_persists(self):
        # given
        client = ServerProxy(f"{self.live_server_url}/", transport=CookiesTransport())
        created_session_id = client.create_session()

        # when
        returned_session_id = client.get_session()

        # then
        self.assertEqual(created_session_id, returned_session_id)

    def test_cant_make_selection_without_session(self):
        # given
        SELECTION = 1
        client = ServerProxy(f"{self.live_server_url}/", transport=CookiesTransport())

        # when
        with self.assertRaises(Fault) as cm:
            client.make_selection(SELECTION)

        # then
        self.assertEqual(cm.exception.faultCode, INTERNAL_ERROR)
        self.assertEqual(cm.exception.faultString, "Internal error: ")

    def test_session_was_joined(self):
        # given
        client_1 = ServerProxy(f"{self.live_server_url}/", transport=CookiesTransport())
        client_2 = ServerProxy(f"{self.live_server_url}/", transport=CookiesTransport())
        created_session_id = client_1.create_session()

        # when
        client_2.join_session(created_session_id)
        returned_session_id = client_2.get_session()

        # then
        self.assertEqual(created_session_id, returned_session_id)
