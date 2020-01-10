# Stubs for tornado_py3.autoreload (Python 3)
#
# NOTE: This dynamically typed stub was automatically generated by stubgen.

from typing import Callable

def start(check_time: int=...) -> None: ...
def wait() -> None: ...
def watch(filename: str) -> None: ...
def add_reload_hook(fn: Callable[[], None]) -> None: ...
def main() -> None: ...
