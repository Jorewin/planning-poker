from django.test import LiveServerTestCase, TestCase
from xmlrpc.client import Transport, SafeTransport, ServerProxy


class CookiesTransport(SafeTransport):
    """A Transport (HTTP) subclass that retains cookies over its lifetime."""
    def __init__(self, context=None):
        super().__init__(context=context)
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
    def test_session_is_created(self):
        session_id = ServerProxy(f"{self.live_server_url}/").server.listMethods()
        self.assertIsInstance(session_id, int)

    # def test_session_id_persists(self):
    #     created_session_id = self.proxy.create_session()
    #     returned_session_id = self.proxy.get_session()
    #     self.assertEquals(created_session_id, returned_session_id)


# class RPCTestCase(TestCase):
#     def test_session_is_created(self):
#         session_id = self.client.post("/", data={"id": 1, "method": "create_session", "jsonrpc": "2.0"}, content_type="application/json").json()["result"]
#         self.assertIsInstance(session_id, int)
#
#     def test_session_id_persists(self):
#         created_session_id = self.client.post("/", data={"id": 1, "method": "create_session", "jsonrpc": "2.0"}, content_type="application/json").json()["result"]
#         returned_session_id = self.client.post("/", data={"id": 1, "method": "get_session", "jsonrpc": "2.0"}, content_type="application/json").json()["result"]
#         self.assertEquals(created_session_id, returned_session_id)
