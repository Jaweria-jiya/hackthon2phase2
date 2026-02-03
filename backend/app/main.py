from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_db_and_tables
from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router


# Create FastAPI application
app = FastAPI(
    title="Todo Authentication API",
    description="Secure todo application with JWT authentication",
    version="1.0.0"
)


# Configure CORS
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    """Initialize database tables on startup."""
    await create_db_and_tables()


# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "todo-auth-api",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Todo Authentication API",
        "docs": "/docs",
        "health": "/health"
    }
