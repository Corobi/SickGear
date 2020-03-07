from tornado_py3 import httputil as httputil, ioloop as ioloop
from tornado_py3.escape import native_str as native_str, utf8 as utf8
from tornado_py3.httpclient import AsyncHTTPClient as AsyncHTTPClient, HTTPError as HTTPError, HTTPRequest as HTTPRequest, HTTPResponse as HTTPResponse, main as main
from tornado_py3.log import app_log as app_log
from typing import Any, Callable, Dict

curl_log: Any

class CurlAsyncHTTPClient(AsyncHTTPClient):
    def initialize(self, max_clients: int=..., defaults: Dict[str, Any]=...) -> None: ...
    def close(self) -> None: ...
    def fetch_impl(self, request: HTTPRequest, callback: Callable[[HTTPResponse], None]) -> None: ...
    def handle_callback_exception(self, callback: Any) -> None: ...

class CurlError(HTTPError):
    errno: Any = ...
    def __init__(self, errno: int, message: str) -> None: ...
