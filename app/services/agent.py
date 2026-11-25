from langgraph.checkpoint.memory import MemorySaver
import os
import operator
from typing import Annotated, TypedDict, List, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.services.tools import ALL_TOOLS

# --- 1. Structured Output Schema with Pydantic Validations ---
class Activity(BaseModel):
    time_slot: str = Field(description="Morning, Afternoon, or Evening")
    title: str = Field(description="Name of the place, monument, or activity")
    description: str = Field(description="Actionable details and guidance for the traveler")
    approx_cost_inr: float = Field(description="Estimated cost in INR for tickets, entry, or activity")

class DayPlan(BaseModel):
    day_number: int
    theme: str = Field(description="E.g., Heritage Walk, Cultural Discovery, Nature & Relaxation")
    activities: List[Activity]
    day_total_cost: float

class ItineraryOutput(BaseModel):
    destination: str
    summary: str
    weather_summary: str
    recommended_hotel: str
    total_budget_spent: float
    days: List[DayPlan]

class PlannerState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    destination: str
    days_count: int
    budget: float
    travellers: int
    final_itinerary: dict
    error_log: Optional[str]

# --- 2. Model Configuration ---
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    temperature=0.2,
    max_retries=3,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

llm_with_tools = llm.bind_tools(ALL_TOOLS)
structured_llm = llm.with_structured_output(ItineraryOutput)

# --- 3. Optimized System Prompt ---
SYSTEM_REASONER_PROMPT = """You are MakeMyTrip's Lead Travel AI Specialist.
Your goal is to build an authentic, practical, and budget-compliant travel itinerary.
Rules:
1. Always check live weather (Open-Meteo) and destination background (Wikipedia) first.
2. Retrieve real attractions (OpenTripMap) and route times (OpenRouteService).
3. Ensure activities are logically ordered geographically to minimize transit time.
4. Strictly respect the user's budget constraint. Do not exceed the provided budget.
"""

def agent_reasoner(state: PlannerState):
    """Reasoning node that calls tools based on user inputs."""
    try:
        messages = [SystemMessage(content=SYSTEM_REASONER_PROMPT)] + state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}
    except Exception as e:
        return {
            "messages": [HumanMessage(content=f"Proceed with base itinerary synthesis. Notice: {str(e)}")],
            "error_log": str(e)
        }

def should_continue(state: PlannerState):
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "finalize"

def finalize_itinerary(state: PlannerState):
    """Synthesizes tool data into a strict JSON schema with fallback safeguards and sanitization."""
    # Step A: Input Sanitization (Handle 0/negative days, negative budget, zero travellers)
    raw_days = state.get("days_count")
    days_count = max(1, int(raw_days if raw_days is not None and raw_days > 0 else 1))
    
    raw_budget = state.get("budget")
    budget = max(1000.0, float(raw_budget if raw_budget is not None and raw_budget > 0 else 1000.0))
    
    raw_travellers = state.get("travellers")
    travellers = max(1, int(raw_travellers if raw_travellers is not None and raw_travellers > 0 else 1))
    
    destination = state.get("destination") or "City"

    finalize_prompt = (
        f"You are finalizing a {days_count}-day trip to {destination} "
        f"for {travellers} traveler(s) with a total budget of INR {budget}. "
        f"CRITICAL: You MUST provide a plan for exactly {days_count} day(s) (minimum 1 day required). "
        "Assemble all tool findings into the required structured format."
    )
    
    try:
        history = [SystemMessage(content=finalize_prompt)] + state["messages"]
        structured_result = structured_llm.invoke(history)
        result_dict = structured_result.model_dump()

        # Step B: Post-Validation (Agar LLM ne days: [] khali de diya toh fill karein)
        if not result_dict.get("days") or len(result_dict["days"]) < 1:
            daily_cost = round(budget / days_count)
            result_dict["days"] = [
                {
                    "day_number": i + 1,
                    "theme": f"Day {i + 1} Local Sightseeing & Heritage Walk",
                    "day_total_cost": daily_cost,
                    "activities": [
                        {
                            "time_slot": "Morning",
                            "title": f"Explore Major Attractions of {destination}",
                            "description": "Visit prominent landmarks and cultural sights.",
                            "approx_cost_inr": round(daily_cost * 0.4)
                        },
                        {
                            "time_slot": "Evening",
                            "title": "Local Market & Food Walk",
                            "description": "Experience regional delicacies and local bazaar.",
                            "approx_cost_inr": round(daily_cost * 0.3)
                        }
                    ]
                }
                for i in range(days_count)
            ]
            result_dict["total_budget_spent"] = budget
            
        return {"final_itinerary": result_dict}

    except Exception as e:
        # Step C: Graceful Defensive Fallback
        daily_cost = round(budget / days_count)
        fallback = {
            "destination": destination,
            "summary": f"Custom curated {days_count}-day plan for {destination}.",
            "weather_summary": "Pleasant conditions expected for local sightseeing.",
            "recommended_hotel": "Central City Comfort Hotel",
            "total_budget_spent": budget,
            "days": [
                {
                    "day_number": i + 1,
                    "theme": f"Day {i + 1} Sights & Exploration",
                    "day_total_cost": daily_cost,
                    "activities": [
                        {
                            "time_slot": "Morning",
                            "title": "Heritage & Landmark Visit",
                            "description": "Explore prominent cultural spots and architecture.",
                            "approx_cost_inr": round(daily_cost * 0.4)
                        },
                        {
                            "time_slot": "Evening",
                            "title": "Local Market Walk & Regional Dinner",
                            "description": "Experience local bazaar culture and authentic food.",
                            "approx_cost_inr": round(daily_cost * 0.3)
                        }
                    ]
                }
                for i in range(days_count)
            ]
        }
        return {"final_itinerary": fallback, "error_log": str(e)}

# --- 4. Workflow Graph Assembly ---
workflow = StateGraph(PlannerState)
workflow.add_node("agent", agent_reasoner)
workflow.add_node("tools", ToolNode(ALL_TOOLS))
workflow.add_node("finalize", finalize_itinerary)


workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    "finalize": "finalize"
})
workflow.add_edge("tools", "agent")
workflow.add_edge("finalize", END)

# In-memory checkpointer for multi-turn conversation memory
memory = MemorySaver()
travel_agent = workflow.compile(checkpointer=memory)