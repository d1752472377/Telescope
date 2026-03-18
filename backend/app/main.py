from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import server, settings, user, vpn  # noqa: F401
from app.routers import auth, servers, settings as settings_router, vpn as vpn_router

app = FastAPI(title='Telescope API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)

app.include_router(servers.router, prefix='/api/servers', tags=['servers'])
app.include_router(vpn_router.router, prefix='/api/vpn', tags=['vpn'])
app.include_router(settings_router.router, prefix='/api/settings', tags=['settings'])
app.include_router(auth.router, prefix='/api/auth', tags=['auth'])


@app.get('/api/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
