import asyncio
import math
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.logging import logger
from app.ml.encounter_risk import encounter_risk_predictor

router = APIRouter(prefix="/ml", tags=["NGBoost Encounter ML"])


def _check_finite(val: float, name: str) -> float:
    if not math.isfinite(val):
        raise ValueError(f"{name} must be a finite numeric value.")
    return float(val)


class EncounterRiskRequest(BaseModel):
    closest_approach_distance: float = Field(
        ...,
        gt=0.0,
        le=50000.0,
        description="Closest approach / miss distance in km (strictly > 0)",
    )
    relative_velocity: float = Field(
        ...,
        ge=0.0,
        le=25.0,
        description="Relative closing velocity magnitude in km/s",
    )
    orbital_altitude: float = Field(
        ...,
        ge=120.0,
        le=42000.0,
        description="Target orbital altitude in km",
    )
    orbital_inclination: float = Field(
        ...,
        ge=0.0,
        le=180.0,
        description="Orbital inclination in degrees",
    )

    @field_validator(
        "closest_approach_distance",
        "relative_velocity",
        "orbital_altitude",
        "orbital_inclination",
    )
    @classmethod
    def ensure_finite(cls, value: float, info) -> float:
        return _check_finite(value, info.field_name)


class ProbabilitiesSchema(BaseModel):
    low: float
    medium: float
    high: float


class UncertaintySchema(BaseModel):
    normalized_entropy: float
    confidence: float
    margin: float
    level: str


class EncounterRiskResponse(BaseModel):
    model: str
    module_name: str
    prediction: str
    predicted_class_index: int
    probabilities: ProbabilitiesSchema
    probabilities_percent: ProbabilitiesSchema
    uncertainty: UncertaintySchema
    input_features: Dict[str, float]
    data_mode: str
    explanation: str
    evaluation_metrics: Dict[str, Any]
    model_info: Dict[str, Any]
    disclaimer: str


@router.get("/model-info")
async def get_ngboost_model_info() -> Dict[str, Any]:
    """Return loaded NGBoost encounter classifier configuration, held-out metrics, and limitations."""
    try:
        return await asyncio.to_thread(encounter_risk_predictor.get_model_info)
    except Exception as exc:
        logger.error("Failed loading NGBoost model info: %s", exc)
        raise HTTPException(status_code=500, detail=f"Unable to load NGBoost model metadata: {exc}") from exc


@router.post("/predict-risk", response_model=EncounterRiskResponse)
async def predict_encounter_risk(payload: EncounterRiskRequest) -> Dict[str, Any]:
    """Run Probabilistic Satellite Encounter Risk Prediction using trained NGBoost NGBClassifier."""
    try:
        result = await asyncio.to_thread(
            encounter_risk_predictor.predict,
            closest_approach_distance=payload.closest_approach_distance,
            relative_velocity=payload.relative_velocity,
            orbital_altitude=payload.orbital_altitude,
            orbital_inclination=payload.orbital_inclination,
        )
        logger.info(
            "NGBoost prediction=%s P(low=%.3f, med=%.3f, high=%.3f) dist=%.2fkm vel=%.2fkm/s",
            result["prediction"],
            result["probabilities"]["low"],
            result["probabilities"]["medium"],
            result["probabilities"]["high"],
            payload.closest_approach_distance,
            payload.relative_velocity,
        )
        return result
    except ValueError as exc:
        logger.warning("Invalid ML encounter input: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("NGBoost prediction error: %s", exc)
        raise HTTPException(status_code=500, detail=f"NGBoost inference failed: {exc}") from exc

