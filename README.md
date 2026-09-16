# AMDSF — Agentic Multi-Domain Space Mission Decision Support Framework

AMDSF is a minimal working prototype demonstrating an explainable multi-agent decision support system for space mission planning, orbital conjunction hazard assessment, space weather analysis, propulsion feasibility, and ground revisit geometry.

---

## 🚀 System Architecture

```text
Mission Planner (User Inputs)
        ↓
Mission Request Parameters
        ↓
Autonomous Domain Agents
    ├── 1. Orbital Debris Agent (Space Situational Awareness / LEO Conjunction)
    ├── 2. Space Weather Agent (NOAA Kp Index / Solar Flare Flux)
    ├── 3. Mission Feasibility Agent (Delta-V / Staging / Payload Capacity)
    └── 4. Coverage Agent (Ground Track / Sensor Swath / Population Revisit)
        ↓
Mission Orchestrator (Cross-Domain Multi-Objective Arbitration)
        ↓
Explainable Mission Recommendation & Risk Mitigation
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS (Aerospace dark theme), Lucide Icons
- **Interactive Map**: Leaflet & React-Leaflet (Live Ground Track, Satellite footprint, Debris markers)
- **Charts & Analytics**: Recharts (Risk breakdown & launch window trade-off analysis)
- **Backend**: Python FastAPI, Uvicorn, Pydantic, CORS Middleware

---

## 📦 How to Run the Project Locally

### 1. Start the Backend API (FastAPI)

Open a terminal in the project root:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Backend runs at: `http://localhost:8000`
- Interactive API Docs (Swagger UI): `http://localhost:8000/docs`

---

### 2. Start the Frontend Dashboard (React + Vite)

Open a second terminal in the project root:

```bash
cd frontend
npm run dev
```

- Open your browser at: `http://localhost:5173`

---

## 🛰️ Dashboard Features

1. **Mission Header & Live Metrics**: Overall Risk, Recommended Launch Window, Mission Readiness (82%), Active Agents count.
2. **Interactive Mission Input Form**: Customizable Payload Mass, Target Orbit, Duration, Budget, Target Region, and Launch Date.
3. **4 Autonomous Agent Cards**: Live status animations and domain metric badges.
4. **Domain Agent Telemetry Breakdown**: Detailed conjunction proximity calculations, Kp indices, launch vehicle capacities, and coverage percentages.
5. **Orchestrator Cross-Domain Reasoning**: Explainable trade-off analysis balancing collision hazards vs fuel/staging costs.
6. **Final Explainable Recommendation Card**: Recommended launch window, readiness percentage, key factors, and mitigation protocols.
7. **Interactive Leaflet Orbit Map**: Satellite ground track, orbital coverage circle, conjunction debris points, and ground telemetry nodes.
8. **Recharts Multi-Domain Analytics**: Risk breakdown bar chart and launch window comparison (Monday vs Tuesday vs Wednesday).
