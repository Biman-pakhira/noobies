"""
Data models for the recommendation service
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class VideoMetadata(BaseModel):
    """Video metadata for recommendations"""
    id: str
    title: str
    description: Optional[str] = None
    duration: int  # seconds
    category: Optional[str] = None
    tags: List[str] = []
    uploader_id: str
    views: int = 0
    likes: int = 0
    dislikes: int = 0
    created_at: datetime


class UserInteraction(BaseModel):
    """User interaction with videos"""
    user_id: str
    video_id: str
    interaction_type: str  # 'watch', 'like', 'dislike', 'skip'
    duration_watched: Optional[int] = None  # seconds
    timestamp: datetime
    completion_percentage: Optional[float] = None


class WatchHistory(BaseModel):
    """User watch history"""
    user_id: str
    video_id: str
    watched_at: datetime
    duration_watched: int
    completion_percentage: float


class RecommendationRequest(BaseModel):
    """Request for recommendations"""
    user_id: str
    limit: int = 10
    exclude_watched: bool = True
    categories: Optional[List[str]] = None


class RecommendationResponse(BaseModel):
    """Recommendation response"""
    video_id: str
    title: str
    thumbnail: Optional[str] = None
    score: float  # 0.0 - 1.0 confidence score
    reason: str  # why recommended (e.g., "based on watch history")
    category: Optional[str] = None


class TrendingResponse(BaseModel):
    """Trending videos response"""
    video_id: str
    title: str
    thumbnail: Optional[str] = None
    views: int
    likes: int
    trend_score: float
    category: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    database: str
    recommendations_engine: str
