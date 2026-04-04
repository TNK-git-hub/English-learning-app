from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import articles, users

app = FastAPI(title="LearnUp API", version="1.0.0")

# CORS — cho phép frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên giới hạn domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(users.router)
app.include_router(articles.router)

@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "LearnUp API is running (FastAPI)."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
