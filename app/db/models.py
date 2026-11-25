from sqlalchemy import Column, Integer, String, Float, JSON
from app.db.database import Base

class TripModel(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, index=True)
    start_date = Column(String)
    end_date = Column(String)
    budget = Column(Float)
    travellers = Column(Integer)
    hotels = Column(JSON, default=[])
    attractions = Column(JSON, default=[])
    itinerary = Column(JSON, default=[])
