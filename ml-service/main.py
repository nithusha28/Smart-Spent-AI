from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import logging

# Import route handlers
from routes.categorizer import router as categorizer_router
from routes.forecasting import router as forecasting_router
from routes.insights import router as insights_router

load_dotenv()

app = FastAPI(
    title="SmartSpend ML Service",
    description="Machine Learning microservice for expense categorization and forecasting",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Include routers
app.include_router(categorizer_router, prefix="/api/categorize", tags=["Categorization"])
app.include_router(forecasting_router, prefix="/api/predict", tags=["Forecasting"])
app.include_router(insights_router, prefix="/api/insights", tags=["Insights"])

# Health check
@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "ML Service"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "SmartSpend ML Service",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development"
    )
