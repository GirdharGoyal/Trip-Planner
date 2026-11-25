# MakeMyTrip AI Travel Planner

FastAPI, React, SQLite aur LangGraph ka use karke banaya gaya full-stack AI travel planner application.

## Features

- **AI Itinerary Planner**: Destination, dates, budget aur travellers ke hisab se day-wise plan generate karta hai.
- **Fast Fallback**: 5-second safe timeout jisse UI kabhi freeze ya hang nahi hoti.
- **Full CRUD Support**:
  - Nayi trip create karein
  - Day-by-day modal itinerary view karein
  - Saari trip details (destination, dates, budget, travellers) edit karein
  - Purani trips delete karein
- **Database Storage**: SQLite aur SQLAlchemy ke sath persistent data storage.


##  Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, Uvicorn, Pydantic
- **AI Agent**: LangGraph, LangChain, Google Gemini API
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios


## Quick Start Guide

### 1. Backend Setup in frist terminal

Terminal mein backend folder mein jaayein:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

python -m pip install --upgrade pip

pip install -r requirements.txt

# backend Run 
python -m uvicorn app.main:app --reload --port 8000


## 2. frontend Setup in second terminal
cd frontend
npm install
npm run dev