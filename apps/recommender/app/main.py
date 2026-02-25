from fastapi import FastAPI

app = FastAPI(title="Recommender Service")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    # Placeholder - will be expanded
    return {"user_id": user_id, "recommendations": []}
