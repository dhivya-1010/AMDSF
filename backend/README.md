# AMDSF Modular Backend

This is the Python FastAPI backend for AMDSF.

### Directory Structure
```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── router.py
│   │   └── routes/
│   │       ├── mission.py
│   │       ├── agents.py
│   │       ├── debris.py
│   │       ├── weather.py
│   │       ├── feasibility.py
│   │       └── coverage.py
│   ├── agents/
│   │   ├── debris_agent/
│   │   ├── weather_agent/
│   │   ├── feasibility_agent/
│   │   ├── coverage_agent/
│   │   └── orchestrator/
│   ├── services/
│   │   ├── donki_service.py
│   │   ├── swpc_service.py
│   │   ├── celestrak_service.py
│   │   └── leolabs_service.py
│   ├── core/
│   │   ├── exceptions.py
│   │   └── logging.py
│   └── schemas/
│       └── mission.py
├── requirements.txt
└── README.md
```

### Running Locally
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
