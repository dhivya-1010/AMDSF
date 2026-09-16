# AMDSF — Agentic Multi-Domain Space Mission Decision Support Framework

AMDSF is a modular, agentic decision-support framework designed for space mission planning, orbital conjunction hazard assessment, space weather dynamics, propulsion/staging feasibility, and ground revisit geometry.

---

## 🌟 Problem Statement & Solution

Space mission planning is inherently multi-domain and high-risk. Mission operators must balance:
1. **Orbital Debris Risk**: Mitigating close conjunctions with trackable orbital debris in dense Low Earth Orbit (LEO) shells.
2. **Space Weather**: Avoiding periods of heightened solar flux, coronal mass ejections (CME), and geomagnetic storms that expand atmospheric drag and induce sensor single-event upsets (SEUs).
3. **Propulsion & Economics**: Ensuring the selected launch vehicle satisfies payload wet mass, fairing envelope, and Delta-V insertion margins within budget limits.
4. **Constellation & Ground Geometry**: Maximizing ground sensor footprint and demographic coverage over targeted regions.

**AMDSF** introduces an **explainable multi-agent architecture** where 4 specialized domain agents concurrently evaluate mission parameters, feeding their findings into a **Mission Orchestrator** that performs rule-based cross-domain trade-off arbitration to produce Pareto-optimal recommendations.

> **Important Operational Disclaimer:** AMDSF is strictly a decision-support prototype. It does not directly command or execute spacecraft thruster firings or flight hardware operations.

---

## 📐 System Architecture

```text
                           [Mission Planner (User)]
                                      │
                                      ▼
                        [Mission Request Parameters]
                                      │
             ┌────────────────────────┼────────────────────────┐
             ▼                        ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │  Orbital Debris │      │  Space Weather  │      │   Feasibility   │      │    Coverage     │
    │      Agent      │      │      Agent      │      │      Agent      │      │      Agent      │
    └────────┬────────┘      └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
             │ (SSA Telemetry)        │ (Kp Index/CME)         │ (Delta-V/Cost)         │ (Swath Geometry)
             ▼                        ▼                        ▼                        ▼
      [CelesTrak / LeoLabs]     [NOAA SWPC / DONKI]       [Vehicle Catalog]        [Regional Footprint]
             │                        │                        │                        │
             └────────────────────────┼────────────────────────┘                        │
                                      ▼                                                 ▼
                       ┌──────────────────────────────┐
                       │     Mission Orchestrator     │
                       │   (Cross-Domain Reasoning)   │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │  Explainable Recommendation  │
                       │    & Risk Mitigation Plan    │
                       └──────────────────────────────┘
```

---

## 🤖 Domain Agents & External Integrations

| Domain Agent | Responsibilities | External Data Sources |
| :--- | :--- | :--- |
| **Orbital Debris Intelligence Agent** | Conjunction vector tracking, relative velocity calculation, catalog proximity filtering | [CelesTrak](https://celestrak.org/), [LeoLabs](https://platform.leolabs.space/) |
| **Space Weather Intelligence Agent** | Real-time planetary Kp index, coronal mass ejection (CME) tracking, geomagnetic storm classification | [NOAA SWPC](https://www.swpc.noaa.gov/), [NASA DONKI](https://kauai.ccmc.gsfc.nasa.gov/DONKI/) |
| **Mission Feasibility Agent** | Staging selection, payload-to-orbit Delta-V margins, fairing envelopes, budget estimation | Prototype Estimation Models |
| **Coverage Intelligence Agent** | Ground footprint geometry, sensor swath access, revisit intervals, population reach | Regional Demographic & Swath Models |
| **Mission Orchestrator** | Multi-objective trade-off arbitration, conflict resolution, Pareto-optimal launch window selection | Rule-Based Reasoning Engine |

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic, HTTPX, Python-Dotenv, Uvicorn
- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS v4, Axios, Lucide React
- **Visualization**: React-Leaflet & Leaflet (Orbital maps), Recharts (Trade-off analytics)
- **Database Ready**: Schema structured for PostgreSQL / PostGIS extension

---

## 📁 Project Directory Structure

```
AMDSF/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app initialization & CORS
│   │   ├── config.py                  # Pydantic environment configuration
│   │   ├── api/
│   │   │   ├── router.py              # Main API router aggregator
│   │   │   └── routes/
│   │   │       ├── mission.py         # POST /api/mission/analyze
│   │   │       ├── agents.py          # GET /api/agents
│   │   │       ├── debris.py          # GET /api/debris/status
│   │   │       ├── weather.py         # GET /api/weather/status
│   │   │       ├── feasibility.py     # GET /api/feasibility/status
│   │   │       └── coverage.py        # GET /api/coverage/status
│   │   ├── agents/
│   │   │   ├── debris_agent/          # agent.py, analyzer.py, models.py
│   │   │   ├── weather_agent/         # agent.py, analyzer.py, models.py
│   │   │   ├── feasibility_agent/     # agent.py, analyzer.py, models.py
│   │   │   ├── coverage_agent/        # agent.py, analyzer.py, models.py
│   │   │   └── orchestrator/          # orchestrator.py, reasoning.py, models.py
│   │   ├── services/
│   │   │   ├── donki_service.py       # NASA DONKI HTTP client
│   │   │   ├── swpc_service.py        # NOAA SWPC HTTP client
│   │   │   ├── celestrak_service.py   # CelesTrak GP element client
│   │   │   └── leolabs_service.py     # LeoLabs SSA gateway
│   │   ├── core/
│   │   │   ├── exceptions.py          # Custom domain exceptions
│   │   │   └── logging.py             # Structured logging setup
│   │   └── schemas/
│   │       └── mission.py             # Pydantic request & summary schemas
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Sticky professional navigation
│   │   │   ├── AgentCard.jsx          # Reusable agent card
│   │   │   ├── RiskCard.jsx           # KPI metrics card
│   │   │   ├── LoadingState.jsx       # Animated loading screen
│   │   │   ├── ErrorState.jsx         # Graceful error banner
│   │   │   ├── MissionMap.jsx         # Leaflet ground track & conjunction map
│   │   │   └── MissionCharts.jsx      # Recharts analytics
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Mission Overview Dashboard
│   │   │   ├── MissionPlanning.jsx    # Mission parameter configuration form
│   │   │   ├── DebrisIntelligence.jsx # SSA & conjunction data
│   │   │   ├── SpaceWeather.jsx       # Kp index & CME feeds
│   │   │   ├── MissionFeasibility.jsx # Delta-V & staging analysis
│   │   │   ├── CoverageAnalysis.jsx   # Sensor swath & revisit geometry
│   │   │   └── MissionRecommendation.jsx # Explainable decision card
│   │   ├── services/
│   │   │   └── api.js                 # Axios service client
│   │   ├── data/
│   │   │   └── demoData.js            # Initial demonstration baseline
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── README.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start / Local Setup

### 1. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API is running at: `http://localhost:8000`
- Interactive Swagger documentation: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Dashboard runs at: `http://localhost:5173`

---

## 🔒 API Key Configuration

To configure external API keys (NASA, LeoLabs):
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Insert your keys into `.env`:
   ```ini
   NASA_API_KEY=your_nasa_donki_key_here
   LEOLABS_API_KEY=your_leolabs_key_here
   ```
*If keys are omitted, AMDSF automatically runs in graceful baseline cache/simulation mode.*

---

## 🛰️ Complete Demo Workflow

1. Navigate to **Mission Planning** via the top Navbar.
2. Enter mission parameters (e.g. `AMDSF Earth Sentinel`, `250kg` payload, `550km` orbit, `India` target region, `$50M` budget).
3. Click **"Run Mission Analysis"**.
4. Observe the concurrent execution across all 4 domain agents.
5. Inspect the **Mission Orchestrator** synthesized reasoning, trade-offs, and **Explainable Recommendation**.
6. Drill down into individual agent pages (**Debris Intelligence**, **Space Weather**, **Feasibility**, **Coverage**) to view underlying telemetry and interactive maps.
