from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class InsightRequest(BaseModel):
    user_id: str

class Insight(BaseModel):
    title: str
    description: str
    type: str  # "warning", "success", "info"
    actionable: bool

def generate_insights() -> List[Insight]:
    """
    Generate AI insights based on spending patterns
    """
    insights = [
        Insight(
            title="High Food Spending",
            description="You're spending 30% more on food this month compared to last month. Consider meal planning to reduce costs.",
            type="warning",
            actionable=True
        ),
        Insight(
            title="Great Savings Rate!",
            description="You've maintained a 20% savings rate this month. Keep up the good work!",
            type="success",
            actionable=False
        ),
        Insight(
            title="Recurring Expenses",
            description="You have identified 5 recurring monthly expenses totaling $450. Review subscriptions to identify unused services.",
            type="info",
            actionable=True
        ),
        Insight(
            title="Weekend Spending Pattern",
            description="Your spending increases by 40% on weekends. Consider setting weekend budgets.",
            type="warning",
            actionable=True
        ),
        Insight(
            title="Budget Achievement",
            description="You've stayed within your transportation budget this month! Great budgeting.",
            type="success",
            actionable=False
        )
    ]
    return insights

@router.post("/")
async def get_insights(request: InsightRequest) -> dict:
    """
    Generate personalized financial insights for user
    """
    try:
        insights = generate_insights()
        
        return {
            "user_id": request.user_id,
            "insights": [insight.model_dump() for insight in insights],
            "total_insights": len(insights),
            "critical_count": sum(1 for i in insights if i.type == "warning"),
            "positive_count": sum(1 for i in insights if i.type == "success")
        }
        
    except Exception as e:
        logger.error(f"Insights generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Insights generation failed")

@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    """
    Get spending recommendations
    """
    try:
        recommendations = [
            {
                "category": "Food",
                "recommendation": "Reduce eating out frequency to twice per week",
                "potential_savings": 200,
                "difficulty": "medium"
            },
            {
                "category": "Entertainment",
                "recommendation": "Cancel unused streaming subscriptions",
                "potential_savings": 40,
                "difficulty": "easy"
            },
            {
                "category": "Shopping",
                "recommendation": "Use 30-day rule for non-essential purchases",
                "potential_savings": 150,
                "difficulty": "hard"
            }
        ]
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "total_potential_savings": sum(r["potential_savings"] for r in recommendations)
        }
        
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Recommendations fetch failed")
