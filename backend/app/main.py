import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base, SessionLocal
from app.utils.sample_data import seed_demo_data
from app.routes import (
    auth_router,
    dashboard_router,
    transactions_router,
    analytics_router,
    ai_router,
    forecast_router,
    risk_router,
    goals_router,
    receipts_router,
    investments_router,
    settings_router,
)

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinSight AI API",
    description="AI-Powered Personal Finance Assistant – AIML Internship Capstone API",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-seed demo user on startup
@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()

# Register Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(transactions_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(forecast_router)
app.include_router(risk_router)
app.include_router(goals_router)
app.include_router(receipts_router)
app.include_router(investments_router)
app.include_router(settings_router)

@app.get("/")
def root():
    return {
        "app": "FinSight AI",
        "tagline": "Smarter Money. Better Decisions.",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "FinSight AI API"}
