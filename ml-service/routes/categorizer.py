from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Category keywords mapping
CATEGORY_KEYWORDS = {
    "Food": ["restaurant", "cafe", "coffee", "pizza", "burger", "food", "lunch", "dinner", "breakfast", "grocery", "supermarket", "market"],
    "Transportation": ["bus", "taxi", "uber", "gas", "petrol", "car", "parking", "train", "flight", "airline"],
    "Entertainment": ["movie", "cinema", "concert", "game", "gaming", "spotify", "netflix", "entertainment", "music"],
    "Shopping": ["mall", "store", "shop", "amazon", "ebay", "fashion", "clothes", "shoes", "retail"],
    "Utilities": ["electricity", "water", "gas", "internet", "phone", "bill", "utility"],
    "Education": ["school", "college", "university", "course", "book", "tuition", "learning"],
    "Health": ["hospital", "doctor", "pharmacy", "medicine", "health", "gym", "fitness"],
    "Rent": ["rent", "apartment", "lease", "housing"],
    "Entertainment & Games": ["game", "gaming", "playstation", "xbox"],
    "Other": []
}

class CategorizationRequest(BaseModel):
    description: str
    confidence_threshold: float = 0.5

class CategorizationResponse(BaseModel):
    category: str
    confidence: float
    keywords_matched: list

def categorize_expense(description: str) -> tuple:
    """
    Categorize expense based on description using keyword matching
    Returns: (category, confidence, matched_keywords)
    """
    description_lower = description.lower()
    scores = {}
    matched_keywords = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        matches = [k for k in keywords if k in description_lower]
        if matches:
            score = len(matches) / len(keywords) if keywords else 0.1
            scores[category] = score
            matched_keywords[category] = matches

    if not scores:
        return "Other", 0.3, []

    # Get category with highest score
    best_category = max(scores, key=scores.get)
    confidence = scores[best_category]

    return best_category, confidence, matched_keywords.get(best_category, [])

@router.post("/")
async def categorize(request: CategorizationRequest) -> CategorizationResponse:
    """
    Categorize an expense based on its description
    """
    try:
        if not request.description or len(request.description.strip()) == 0:
            raise HTTPException(status_code=400, detail="Description cannot be empty")

        category, confidence, keywords = categorize_expense(request.description)

        # Return lower confidence if below threshold
        if confidence < request.confidence_threshold:
            category = "Other"
            confidence = 0.3

        return CategorizationResponse(
            category=category,
            confidence=round(confidence, 2),
            keywords_matched=keywords
        )

    except Exception as e:
        logger.error(f"Categorization error: {str(e)}")
        raise HTTPException(status_code=500, detail="Categorization failed")

@router.get("/categories")
async def get_categories():
    """
    Get list of all available categories
    """
    return {
        "categories": [cat for cat in CATEGORY_KEYWORDS.keys() if cat != "Other"],
        "total": len(CATEGORY_KEYWORDS) - 1
    }
