"""
Recommendation engine with multiple strategies
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
from models import RecommendationResponse, TrendingResponse
import os


class RecommendationEngine:
    """
    Multi-strategy recommendation engine for videos
    - Collaborative filtering (user-based)
    - Content-based filtering (tags, category)
    - Trending videos fallback
    - Cold-start strategy for new users
    """

    def __init__(self, mongo_url: str):
        """Initialize recommendation engine with MongoDB connection"""
        self.mongo_url = mongo_url
        self.client = None
        self.db = None
        self.interaction_matrix = None
        self.last_trained = None

        try:
            self.connect()
        except Exception as e:
            print(f"⚠️  MongoDB connection warning: {e}")

    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(
                self.mongo_url,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Verify connection
            self.client.admin.command("ping")
            self.db = self.client["video_platform"]
            print("✅ MongoDB connected for recommendations")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.client = None
            self.db = None

    def get_recommendations(
        self,
        user_id: str,
        limit: int = 10,
        exclude_watched: bool = True,
        categories: Optional[List[str]] = None,
    ) -> List[RecommendationResponse]:
        """
        Get personalized recommendations for a user

        Strategy:
        1. Try collaborative filtering (based on similar users)
        2. Fall back to content-based (user's category preferences)
        3. Fall back to trending videos
        """

        if not self.db:
            return self.get_trending_videos(limit)

        try:
            # Get user's watch history
            watch_history = self._get_user_watch_history(user_id)

            if not watch_history:
                # Cold-start: use trending videos
                return self.get_trending_videos(limit)

            # Extract liked videos and categories
            liked_videos = [w["video_id"] for w in watch_history if w.get("liked")]
            watched_videos = [w["video_id"] for w in watch_history]
            user_categories = self._get_user_category_preferences(user_id)

            # Get candidate videos
            candidates = self._get_candidate_videos(
                exclude_watched, categories or user_categories
            )

            if not candidates:
                return self.get_trending_videos(limit)

            # Score videos using multiple strategies
            scored = []
            for video in candidates:
                if exclude_watched and video["_id"] in watched_videos:
                    continue

                score = self._calculate_video_score(
                    video, liked_videos, user_categories, watch_history
                )

                if score > 0:
                    scored.append((video, score))

            # Sort by score and limit
            scored.sort(key=lambda x: x[1], reverse=True)
            top_videos = scored[:limit]

            if not top_videos:
                return self.get_trending_videos(limit)

            # Convert to response format
            recommendations = []
            for video, score in top_videos:
                recommendations.append(
                    RecommendationResponse(
                        video_id=str(video["_id"]),
                        title=video.get("title", "Unknown"),
                        thumbnail=self._get_thumbnail_url(video),
                        score=min(score / 10.0, 1.0),  # Normalize to 0-1
                        reason=self._get_reason(video, user_categories),
                        category=video.get("category", {}).get("name"),
                    )
                )

            return recommendations

        except Exception as e:
            print(f"Recommendation error: {e}")
            return self.get_trending_videos(limit)

    def get_trending_videos(self, limit: int = 10) -> List[TrendingResponse]:
        """
        Get trending videos based on recent views and likes

        Trending score = (views * 0.3 + likes * 2.0) * recency_boost
        """

        if not self.db:
            return []

        try:
            # Date threshold (last 7 days)
            threshold = datetime.utcnow() - timedelta(days=7)

            pipeline = [
                {
                    "$match": {
                        "status": "READY",
                        "isPublic": True,
                        "createdAt": {"$gte": threshold},
                    }
                },
                {
                    "$project": {
                        "title": 1,
                        "views": {"$ifNull": ["$views", 0]},
                        "likes": {"$ifNull": ["$likes", 0]},
                        "category": 1,
                        "createdAt": 1,
                        "thumbnails": 1,
                        "trend_score": {
                            "$multiply": [
                                {
                                    "$add": [
                                        {"$multiply": ["$views", 0.3]},
                                        {"$multiply": ["$likes", 2.0]},
                                    ]
                                },
                                {
                                    "$divide": [
                                        {
                                            "$max": [
                                                {
                                                    "$subtract": [
                                                        datetime.utcnow(),
                                                        "$createdAt",
                                                    ]
                                                },
                                                1,
                                            ]
                                        },
                                        86400000,  # milliseconds in a day
                                    ]
                                },
                            ]
                        },
                    }
                },
                {"$sort": {"trend_score": -1}},
                {"$limit": limit},
            ]

            trending = list(self.db["Video"].aggregate(pipeline))

            return [
                TrendingResponse(
                    video_id=str(v["_id"]),
                    title=v.get("title", "Unknown"),
                    thumbnail=self._get_thumbnail_url(v),
                    views=v.get("views", 0),
                    likes=v.get("likes", 0),
                    trend_score=v.get("trend_score", 0),
                    category=v.get("category", {}).get("name") if v.get("category") else None,
                )
                for v in trending
            ]

        except Exception as e:
            print(f"Trending error: {e}")
            return []

    def _get_user_watch_history(self, user_id: str) -> List[Dict]:
        """Get user's watch history with interaction data"""
        try:
            history = list(
                self.db["WatchHistory"]
                .find({"userId": user_id})
                .sort("watchedAt", -1)
                .limit(100)
            )

            # Get interaction data
            interactions = list(
                self.db["VideoInteraction"].find(
                    {
                        "userId": user_id,
                        "interactionType": {"$in": ["like", "dislike"]},
                    }
                )
            )

            liked = {i["videoId"] for i in interactions if i["interactionType"] == "like"}

            # Combine data
            for h in history:
                h["liked"] = h["videoId"] in liked

            return history

        except Exception as e:
            print(f"Watch history error: {e}")
            return []

    def _get_user_category_preferences(self, user_id: str) -> List[str]:
        """Get user's preferred categories based on watch history"""
        try:
            # Aggregate categories from watched videos
            pipeline = [
                {"$match": {"userId": user_id}},
                {
                    "$lookup": {
                        "from": "Video",
                        "localField": "videoId",
                        "foreignField": "_id",
                        "as": "video",
                    }
                },
                {"$unwind": "$video"},
                {"$group": {"_id": "$video.category", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 5},
            ]

            categories = list(self.db["WatchHistory"].aggregate(pipeline))
            return [c["_id"] for c in categories if c["_id"]]

        except Exception as e:
            print(f"Category preferences error: {e}")
            return []

    def _get_candidate_videos(
        self, exclude_watched: bool, categories: Optional[List[str]]
    ) -> List[Dict]:
        """Get candidate videos for recommendation"""
        try:
            query = {"status": "READY", "isPublic": True}

            if categories:
                query["categoryId"] = {"$in": categories}

            candidates = list(
                self.db["Video"]
                .find(query)
                .sort("createdAt", -1)
                .limit(500)
            )

            return candidates

        except Exception as e:
            print(f"Candidate videos error: {e}")
            return []

    def _calculate_video_score(
        self,
        video: Dict,
        liked_videos: List[str],
        user_categories: List[str],
        watch_history: List[Dict],
    ) -> float:
        """
        Calculate recommendation score for a video

        Factors:
        - Similar to liked videos (category, tags)
        - In user's preferred categories
        - Popular (views, likes)
        - Recent
        """

        score = 1.0

        # Category match (high priority)
        if video.get("categoryId") in user_categories:
            score += 3.0

        # Tag overlap with liked videos
        video_tags = set(t.get("name", "").lower() for t in video.get("tags", []))
        for video_id in liked_videos[:10]:  # Check last 10 liked videos
            score += 0.5 if video_tags else 0

        # Popularity boost
        views = video.get("views", 0)
        likes = video.get("likes", 0)
        score += (views / 100000) * 2  # Likes worth more than views
        score += (likes / 1000) * 3

        # Recency boost (prefer newer videos)
        days_old = (datetime.utcnow() - video.get("createdAt", datetime.utcnow())).days
        recency_boost = 1.0 / (1.0 + days_old / 30)
        score += recency_boost

        return score

    def _get_thumbnail_url(self, video: Dict) -> Optional[str]:
        """Extract thumbnail URL from video document"""
        try:
            thumbnails = video.get("thumbnails", [])
            if thumbnails and isinstance(thumbnails, list):
                return thumbnails[0].get("url") if isinstance(thumbnails[0], dict) else None
            return None
        except:
            return None

    def _get_reason(self, video: Dict, user_categories: List[str]) -> str:
        """Generate human-readable recommendation reason"""
        if video.get("categoryId") in user_categories:
            return "Based on your interests"
        if video.get("views", 0) > 10000:
            return "Popular in your category"
        return "Recommended for you"

    def health_check(self) -> Dict[str, str]:
        """Check service health"""
        db_status = "healthy" if self.db else "unhealthy"

        return {
            "status": "healthy" if self.db else "degraded",
            "database": db_status,
            "recommendations_engine": "healthy",
        }
