from pydantic import BaseModel
from typing import List, Optional, Any

class TripBase(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float
    travellers: int
    hotels: Optional[List[Any]] = []
    attractions: Optional[List[Any]] = []
    itinerary: Optional[List[Any]] = []

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    travellers: Optional[int] = None
    hotels: Optional[List[Any]] = None
    attractions: Optional[List[Any]] = None
    itinerary: Optional[List[Any]] = None

class TripResponse(TripBase):
    id: int

    class Config:
        from_attributes = True
