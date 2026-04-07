"""
LearnUp API — Entry point.
Initializes FastAPI app, CORS, error handlers, and mounts all routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, article_router, tag_router
from middleware.error_handler import register_error_handlers

app = FastAPI(
    title="LearnUp API",
    version="2.0.0",
    description="English Learning Platform API"
)

# CORS — allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global error handlers
register_error_handlers(app)

# Mount routers
app.include_router(auth_router.router)
app.include_router(article_router.router)
app.include_router(tag_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "LearnUp API v2.0 is running (FastAPI)."}


if __name__ == "__main__":
    import uvicorn
    from config.settings import settings
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
