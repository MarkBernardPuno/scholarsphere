import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database.database import init_schema
from app.routes import (
    authors,
    auth,
    integrations,
    lookups,
    presentations,
    research,
    research_repository,
    research_evaluations,
    research_outputs,
    users,
)

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

# Create tables only when explicitly enabled for local/dev convenience.
db_auto_create = os.getenv("DB_AUTO_CREATE", "false").strip().lower() in {"1", "true", "yes", "on"}
if db_auto_create:
    init_schema("database/schema.sql")

# Initialize FastAPI app
app = FastAPI(
    title="Scholar Sphere API",
    description="ScholarSphere backend API with JWT auth and research data services",
    version="2.0.0"
)

# CORS for browser-based clients (configure via CORS_ALLOW_ORIGINS env var).
raw_origins = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
allow_all_origins = raw_origins.strip() == "*"
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else allowed_origins,
    # Browsers reject credentials when Access-Control-Allow-Origin is '*'.
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(authors.router)
app.include_router(users.router)
app.include_router(research.router)
app.include_router(research_repository.router)
app.include_router(research_evaluations.router)
app.include_router(research_outputs.router)
app.include_router(lookups.router)
app.include_router(presentations.router)
app.include_router(integrations.router)


# ======================== ROOT ENDPOINT ========================

@app.get("/", tags=["Root"])
def read_root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to Scholar Sphere API",
        "version": "2.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn

    api_host = os.getenv("API_HOST", "0.0.0.0")
    api_port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run(app, host=api_host, port=api_port)
