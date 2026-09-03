from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.analysis import router as analysis_router

from app.config import get_settings


settings = get_settings()

app = FastAPI(
    title="SentinelPay API",
    version="0.1.0",
)

app.include_router(analysis_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "sentinelpay-backend",
        "version": "0.1.0",
    }