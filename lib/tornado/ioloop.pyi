import concurrent.futures
import datetime
from tornado_py3.concurrent import Future as Future, chain_future as chain_future, future_add_done_callback as future_add_done_callback, future_set_exc_info as future_set_exc_info, is_future as is_future
from tornado_py3.log import app_log as app_log
from tornado_py3.util import Configurable as Configurable, TimeoutError as TimeoutError, import_object as import_object
from typing import Any, Awaitable, Callable, Optional, Tuple, Type, Union
from typing_extensions import Protocol as Protocol

class _Selectable:
    def fileno(self) -> int: ...
    def close(self) -> None: ...

class IOLoop(Configurable):
    NONE: int = ...
    READ: int = ...
    WRITE: int = ...
    ERROR: int = ...
    @classmethod
    def configure(cls: Any, impl: Union[None, str, Type[Configurable]], **kwargs: Any) -> None: ...
    @staticmethod
    def instance() -> IOLoop: ...
    def install(self) -> None: ...
    @staticmethod
    def clear_instance() -> None: ...
    @staticmethod
    def current() -> IOLoop: ...
    @staticmethod
    def current(instance: bool=...) -> Optional[IOLoop]: ...
    @staticmethod
    def current(instance: bool=...) -> Optional[IOLoop]: ...
    def make_current(self) -> None: ...
    @staticmethod
    def clear_current() -> None: ...
    @classmethod
    def configurable_base(cls: Any) -> Type[Configurable]: ...
    @classmethod
    def configurable_default(cls: Any) -> Type[Configurable]: ...
    def initialize(self, make_current: bool=...) -> None: ...
    def close(self, all_fds: bool=...) -> None: ...
    def add_handler(self, fd: int, handler: Callable[[int, int], None], events: int) -> None: ...
    def add_handler(self, fd: _S, handler: Callable[[_S, int], None], events: int) -> None: ...
    def add_handler(self, fd: Union[int, _Selectable], handler: Callable[..., None], events: int) -> None: ...
    def update_handler(self, fd: Union[int, _Selectable], events: int) -> None: ...
    def remove_handler(self, fd: Union[int, _Selectable]) -> None: ...
    def start(self) -> None: ...
    def stop(self) -> None: ...
    def run_sync(self, func: Callable, timeout: float=...) -> Any: ...
    def time(self) -> float: ...
    def add_timeout(self, deadline: Union[float, datetime.timedelta], callback: Callable[..., None], *args: Any, **kwargs: Any) -> object: ...
    def call_later(self, delay: float, callback: Callable[..., None], *args: Any, **kwargs: Any) -> object: ...
    def call_at(self, when: float, callback: Callable[..., None], *args: Any, **kwargs: Any) -> object: ...
    def remove_timeout(self, timeout: object) -> None: ...
    def add_callback(self, callback: Callable, *args: Any, **kwargs: Any) -> None: ...
    def add_callback_from_signal(self, callback: Callable, *args: Any, **kwargs: Any) -> None: ...
    def spawn_callback(self, callback: Callable, *args: Any, **kwargs: Any) -> None: ...
    def add_future(self, future: Union[Future[_T], concurrent.futures.Future[_T]], callback: Callable[[Future[_T]], None]) -> None: ...
    def run_in_executor(self, executor: Optional[concurrent.futures.Executor], func: Callable[..., _T], *args: Any) -> Awaitable[_T]: ...
    def set_default_executor(self, executor: concurrent.futures.Executor) -> None: ...
    def split_fd(self, fd: Union[int, _Selectable]) -> Tuple[int, Union[int, _Selectable]]: ...
    def close_fd(self, fd: Union[int, _Selectable]) -> None: ...

class _Timeout:
    deadline: Any = ...
    callback: Any = ...
    tdeadline: Any = ...
    def __init__(self, deadline: float, callback: Callable[[], None], io_loop: IOLoop) -> None: ...
    def __lt__(self, other: _Timeout) -> bool: ...
    def __le__(self, other: _Timeout) -> bool: ...

class PeriodicCallback:
    callback: Any = ...
    callback_time: Any = ...
    jitter: Any = ...
    def __init__(self, callback: Callable[[], None], callback_time: float, jitter: float=...) -> None: ...
    io_loop: Any = ...
    def start(self) -> None: ...
    def stop(self) -> None: ...
    def is_running(self) -> bool: ...
