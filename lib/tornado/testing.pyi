# Stubs for tornado_py3.testing (Python 3)
#
# NOTE: This dynamically typed stub was automatically generated by stubgen.

import logging
import socket
import unittest
from collections.abc import Generator
from tornado_py3.httpclient import AsyncHTTPClient, HTTPResponse
from tornado_py3.httpserver import HTTPServer
from tornado_py3.ioloop import IOLoop
from tornado_py3.util import basestring_type
from tornado_py3.web import Application
from types import TracebackType
from typing import Any, Callable, Coroutine, Dict, Optional, Tuple, Type, Union

def bind_unused_port(reuse_port: bool=...) -> Tuple[socket.socket, int]: ...
def get_async_test_timeout() -> float: ...

class _TestMethodWrapper:
    orig_method: Any = ...
    def __init__(self, orig_method: Callable) -> None: ...
    def __call__(self, *args: Any, **kwargs: Any) -> None: ...
    def __getattr__(self, name: str) -> Any: ...

class AsyncTestCase(unittest.TestCase):
    def __init__(self, methodName: str=...) -> None: ...
    io_loop: Any = ...
    def setUp(self) -> None: ...
    def tearDown(self) -> None: ...
    def get_new_ioloop(self) -> IOLoop: ...
    def run(self, result: Optional[unittest.TestResult]=...) -> Optional[unittest.TestResult]: ...
    def stop(self, _arg: Any=..., **kwargs: Any) -> None: ...
    def wait(self, condition: Optional[Callable[..., bool]]=..., timeout: Optional[float]=...) -> None: ...

class AsyncHTTPTestCase(AsyncTestCase):
    http_client: Any = ...
    http_server: Any = ...
    def setUp(self) -> None: ...
    def get_http_client(self) -> AsyncHTTPClient: ...
    def get_http_server(self) -> HTTPServer: ...
    def get_app(self) -> Application: ...
    def fetch(self, path: str, raise_error: bool=..., **kwargs: Any) -> HTTPResponse: ...
    def get_httpserver_options(self) -> Dict[str, Any]: ...
    def get_http_port(self) -> int: ...
    def get_protocol(self) -> str: ...
    def get_url(self, path: str) -> str: ...
    def tearDown(self) -> None: ...

class AsyncHTTPSTestCase(AsyncHTTPTestCase):
    def get_http_client(self) -> AsyncHTTPClient: ...
    def get_httpserver_options(self) -> Dict[str, Any]: ...
    def get_ssl_options(self) -> Dict[str, Any]: ...
    @staticmethod
    def default_ssl_options() -> Dict[str, Any]: ...
    def get_protocol(self) -> str: ...

def gen_test(*, timeout: Optional[float]=...) -> Callable[[Callable[..., Union[Generator, Coroutine]]], Callable[..., None]]: ...

class ExpectLog(logging.Filter):
    logger: Any = ...
    regex: Any = ...
    required: Any = ...
    matched: bool = ...
    logged_stack: bool = ...
    def __init__(self, logger: Union[logging.Logger, basestring_type], regex: str, required: bool=...) -> None: ...
    def filter(self, record: logging.LogRecord) -> bool: ...
    def __enter__(self) -> ExpectLog: ...
    def __exit__(self, typ: Optional[Type[BaseException]], value: Optional[BaseException], tb: Optional[TracebackType]) -> None: ...

def main(**kwargs: Any) -> None: ...
