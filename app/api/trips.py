import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import TripModel
from app.schemas.trip import TripCreate, TripUpdate, TripResponse

router = APIRouter(prefix="/api/trips", tags=["Trips"])

def generate_trip_details(destination: str, start_date: str, end_date: str, budget: float):
    # Din calculate karein
    try:
        d1 = datetime.strptime(start_date, "%Y-%m-%d")
        d2 = datetime.strptime(end_date, "%Y-%m-%d")
        days = max((d2 - d1).days + 1, 1)
    except Exception:
        days = 3

    # 1. Day-wise Itinerary
    itinerary = []
    for day in range(1, days + 1):
        itinerary.append({
            "day": day,
            "title": f"Day {day}: Exploring {destination}",
            "morning": f"Breakfast & visit famous heritage spots in {destination}",
            "afternoon": f"Local cuisine lunch and market exploration",
            "evening": f"Sunset viewing, relaxing promenade & dinner",
            "estimated_cost": int(budget / days)
        })

    # 2. Recommended Hotels
    hotels = [
        {"name": f"{destination} Grand Palace & Resort", "rating": 4.5, "price_per_night": int((budget * 0.3) / days)},
        {"name": f"{destination} Comfort Suites", "rating": 4.2, "price_per_night": int((budget * 0.15) / days)}
    ]

    # 3. Famous Attractions
    attractions = [
        {"name": f"Historic Fort & Museum of {destination}", "category": "Heritage", "fee": 500},
        {"name": f"{destination} Scenic Viewpoint", "category": "Nature", "fee": 0},
        {"name": f"Central Cultural Market", "category": "Shopping", "fee": 0}
    ]

    return itinerary, hotels, attractions


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    trip_data = trip.model_dump()

    # Agar frontend se itinerary/hotels/attractions nahi aaye ya empty hain, to generate karein
    if not trip_data.get("itinerary") or not trip_data.get("hotels"):
        itinerary, hotels, attractions = generate_trip_details(
            destination=trip.destination,
            start_date=trip.start_date,
            end_date=trip.end_date,
            budget=trip.budget
        )
        trip_data["itinerary"] = itinerary
        trip_data["hotels"] = hotels
        trip_data["attractions"] = attractions

    db_trip = TripModel(**trip_data)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[TripResponse])
def get_all_trips(db: Session = Depends(get_db)):
    return db.query(TripModel).all()


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip record not found")
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db)):
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip record not found")
    
    update_data = trip_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(trip, key, value)
        
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip record not found")
    db.delete(trip)
    db.commit()
    return None