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

### Orbital debris screening

The debris agent retrieves GP/TLE records from CelesTrak, validates both line
checksums, propagates valid records with SGP4, transforms TEME coordinates to
ITRS/ECEF with Astropy, and uses `scipy.spatial.cKDTree` at matching epochs to
screen candidates. Around a sampled minimum, it optionally performs a bounded
one-dimensional numerical refinement by evaluating fresh SGP4 states; the
reported refined TCA remains a local sampled-window estimate, not a continuous
high-precision solution.

Results are preliminary miss-distance and relative-velocity measurements only:
they are not covariance-aware collision probabilities and do not provide
operational collision-avoidance decisions. SGP4 errors remain associated with
their object and UTC epoch, while object validity is tracked independently at
each timestamp.

Mission requests may provide `orbit.norad_id`, `orbit.object_name`,
`orbit.tle_line1`, and `orbit.tle_line2`. The interval, time step, and screening
threshold are configurable through `orbit.propagation_interval_minutes`,
`orbit.propagation_step_seconds`, and `orbit.screening_distance_km`. If no
mission TLE is supplied, the API preserves its response shape but explicitly
reports insufficient orbital data rather than fabricating positions or risk
counts. CelesTrak retrieval time, TLE epoch, cache state, coordinate frame,
and propagation settings are included in the response.

Run backend tests with:

```bash
cd backend
pytest -q
```
