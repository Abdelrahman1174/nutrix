from fastapi import FastAPI
from backend.routes.plan_routes import router as plan_router

app = FastAPI(title="Nutrix API", version="1.0.0")

app.include_router(plan_router)

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}