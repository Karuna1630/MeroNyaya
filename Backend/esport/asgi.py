"""Compatibility ASGI module for legacy deployment command.

This module proxies to the real Django ASGI app in meronaya.asgi.
"""

from meronaya.asgi import application
