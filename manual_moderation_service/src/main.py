# thirdparty
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

# project
from api.v1 import api_router as api_v1_router
from core.config import settings
from handlers import exception_handlers

app = FastAPI(
    title=settings.project_name,
    description="API сервиса авторизации кинотеатра",
    version="1.0.0",
    docs_url="/api-moderator/openapi",
    openapi_url="/api-moderator/openapi.json",
    default_response_class=ORJSONResponse,
    exception_handlers=exception_handlers,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы, включая OPTIONS
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api-moderator/v1")
