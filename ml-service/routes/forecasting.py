from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)

class PredictionRequest(BaseModel):
    user_id: str
    category: Optional[str] = None
    days_ahead: int = 30

class PredictionResponse(BaseModel):
    category: str
    predicted_amount: float
    prediction_date: str
    confidence: float

def simple_forecast(historical_data: List[float], days_ahead: int = 30) -> tuple:
    """
    Simple time-series forecasting using moving average
    Returns: (average_daily, confidence)
    """
    if not historical_data or len(historical_data) == 0:
        return 0, 0.0

    # Calculate moving average
    avg = sum(historical_data) / len(historical_data)
    
    # Confidence based on data points
    data_count = len(historical_data)
    confidence = min(0.95, 0.3 + (data_count * 0.05))
    
    return avg, confidence

@router.post("/")
async def predict(request: PredictionRequest) -> dict:
    """
    Generate spending forecasts for user
    """
    try:
        # Mock implementation - in production, fetch actual expense data from database
        # and apply ML models
        
        predictions = []
        
        categories = request.category.split(",") if request.category else [
            "Food", "Transportation", "Entertainment", "Shopping", "Utilities"
        ]
        
        for category in categories:
            # Simulate historical data
            historical = [50 + (i % 20) for i in range(30)]
            
            daily_avg, confidence = simple_forecast(historical, request.days_ahead)
            predicted_amount = daily_avg * request.days_ahead
            
            predictions.append({
                "category": category.strip(),
                "amount": round(predicted_amount, 2),
                "daily_average": round(daily_avg, 2),
                "confidence": round(confidence, 2),
                "date": (datetime.now() + timedelta(days=request.days_ahead)).isoformat()
            })
        
        return {
            "user_id": request.user_id,
            "predictions": predictions,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Prediction generation failed")

@router.get("/trend/{user_id}")
async def get_trend(user_id: str, days: int = 30):
    """
    Get spending trend for user
    """
    try:
        # Mock implementation
        trend_data = [
            {"date": (datetime.now() - timedelta(days=i)).isoformat(), "amount": 50 + (i % 30)}
            for i in range(days)
        ]
        
        return {
            "user_id": user_id,
            "trend": trend_data,
            "average": sum(t["amount"] for t in trend_data) / len(trend_data),
            "min": min(t["amount"] for t in trend_data),
            "max": max(t["amount"] for t in trend_data)
        }
        
    except Exception as e:
        logger.error(f"Trend error: {str(e)}")
        raise HTTPException(status_code=500, detail="Trend fetch failed")
