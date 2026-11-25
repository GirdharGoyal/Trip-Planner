from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api import trips, planner

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MakeMyTrip AI Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(trips.router)
app.include_router(planner.router)

@app.get("/health")
def health_check():
    return {"status": "online"}