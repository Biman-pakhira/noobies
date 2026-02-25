"""
FastAPI Recommendation Service
Provides personalized video recommendations using multiple strategies
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from models import (
    RecommendationRequest,
    RecommendationResponse,
    TrendingResponse,
    HealthResponse,
)
from recommendations_engine import RecommendationEngine

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Video Recommendation Service",
    description="AI-powered video recommendation engine",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommendation engine
MONGO_URL = os.getenv("DATABASE_URL", "mongodb://admin:password@localhost:27017")
recommendation_engine = RecommendationEngine(MONGO_URL)


@app.on_event("startup")
async def startup():
    """Startup event"""
    print("\n" + "=" * 60)
    print("🤖 Recommendation Service Starting")
    print("=" * 60)
    health = recommendation_engine.health_check()
    print(f"✅ Service Status: {health['status']}")
    print(f"📊 Database: {health['database']}")
    print(f"🎯 Recommendations Engine: {health['recommendations_engine']}")
    print("=" * 60 + "\n")


@app.on_event("shutdown")
async def shutdown():
    """Shutdown event"""
    if recommendation_engine.client:
        recommendation_engine.client.close()
    print("🛑 Recommendation Service Stopped\n")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    health = recommendation_engine.health_check()
    if health["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail="Service unavailable")
    return HealthResponse(**health)


@app.get("/api/recommendations/{user_id}", response_model=List[RecommendationResponse])
async def get_recommendations(
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    exclude_watched: bool = Query(True),
    categories: Optional[List[str]] = Query(None),
):
    """
    Get personalized recommendations for a user

    **Parameters:**
    - `user_id`: User ID (required)
    - `limit`: Number of recommendations (1-100, default: 10)
    - `exclude_watched`: Exclude watched videos (default: true)
    - `categories`: Filter by categories (optional)

    **Returns:** List of recommended videos with scores

    **Strategies Used:**
    1. Collaborative filtering (similar users)
    2. Content-based filtering (tags, categories)
    3. Trending videos fallback
    """

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        recommendations = recommendation_engine.get_recommendations(
            user_id=user_id,
            limit=limit,
            exclude_watched=exclude_watched,
            categories=categories,
        )

        return recommendations

    except Exception as e:
        print(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")


@app.get("/api/recommendations/trending", response_model=List[TrendingResponse])
async def get_trending(
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get trending videos

    **Parameters:**
    - `limit`: Number of videos (1-100, default: 20)

    **Returns:** List of trending videos

    **Trending Score Calculation:**
    - Based on recent views and likes
    - Recency boost for newer videos
    - Last 7 days window
    """

    try:
        trending = recommendation_engine.get_trending_videos(limit)
        return trending

    except Exception as e:
        print(f"Error getting trending: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trending videos")


@app.post("/api/recommendations/train")
async def train_model():
    """
    Trigger model retraining/update

    **Note:** Current implementation uses on-demand calculations
    Future: Can be extended for periodic model training
    """

    try:
        return {
            "status": "success",
            "message": "Recommendation model updated",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        print(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail="Failed to train model")


@app.get("/api/recommendations/stats")
async def get_stats():
    """Get recommendation engine statistics"""

    health = recommendation_engine.health_check()

    return {
        "status": health["status"],
        "database": health["database"],
        "engine": health["recommendations_engine"],
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "name": "Video Recommendation Service",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "health": "/health",
            "recommendations": "/api/recommendations/{user_id}",
            "trending": "/api/recommendations/trending",
            "train": "/api/recommendations/train",
            "stats": "/api/recommendations/stats",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("RECOMMENDER_PORT", "3002")),
        log_level="info",
    )
