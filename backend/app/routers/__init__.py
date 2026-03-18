from .auth import router as auth_router
from .servers import router as servers_router
from .vpn import router as vpn_router

__all__ = ['auth_router', 'servers_router', 'vpn_router']
