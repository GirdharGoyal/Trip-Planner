# backend/app/api/planner.py
# To this:
from app.services.agent import travel_agent
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.agent import travel_agent

router = APIRouter(prefix="/api/planner", tags=["AI Planner"])

class PlanRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travellers: int

@router.post("/generate")
async def generate_trip_plan(req: PlanRequest):
    try:
        sys_msg = (
            "You are MakeMyTrip's lead AI travel architect. Use your tools to check destination details, "
            "hotels, weather, top attractions, routes, and budget calculation before finalizing the plan."
        )
        user_msg = (
            f"Generate a {req.days}-day trip to {req.destination} for {req.travellers} travellers "
            f"with a total budget of INR {req.budget}. Call relevant tools to verify information."
        )

        initial_state = {
            "messages": [SystemMessage(content=sys_msg), HumanMessage(content=user_msg)],
            "destination": req.destination,
            "days_count": req.days,
            "budget": req.budget,
            "travellers": req.travellers,
            "final_itinerary": {}
        }

        result = await travel_agent.ainvoke(initial_state)
        return result.get("final_itinerary", {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))