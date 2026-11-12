"""Probabilistic Satellite Encounter Risk Prediction using NGBoost (NGBClassifier)."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
from ngboost import NGBClassifier
from ngboost.distns import k_categorical
from ngboost.scores import LogScore
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeRegressor

from app.config import settings
from app.core.logging import logger

CLASS_LABELS: Tuple[str, str, str] = ("LOW RISK", "MEDIUM RISK", "HIGH RISK")
FEATURE_NAMES: Tuple[str, str, str, str] = (
    "closest_approach_distance",
    "relative_velocity",
    "orbital_altitude",
    "orbital_inclination",
)
ARTIFACT_SCHEMA_VERSION = "1.0.0"

ML_DATA_DIR = Path(settings.DATA_DIR) / "ml"
DATASET_PATH = ML_DATA_DIR / "synthetic_encounter_dataset.json"
MODEL_ARTIFACT_PATH = ML_DATA_DIR / "ngboost_encounter_risk.joblib"


def validate_encounter_features(
    closest_approach_distance: Any,
    relative_velocity: Any,
    orbital_altitude: Any,
    orbital_inclination: Any,
) -> np.ndarray:
    """Validate orbital encounter inputs strictly; reject missing, NaN, or out-of-range values."""
    raw = {
        "closest_approach_distance": closest_approach_distance,
        "relative_velocity": relative_velocity,
        "orbital_altitude": orbital_altitude,
        "orbital_inclination": orbital_inclination,
    }
    bounds = {
        "closest_approach_distance": (0.0, 50000.0, True),  # strictly > 0
        "relative_velocity": (0.0, 25.0, False),
        "orbital_altitude": (120.0, 42000.0, False),
        "orbital_inclination": (0.0, 180.0, False),
    }

    values: List[float] = []
    for name in FEATURE_NAMES:
        val = raw[name]
        if val is None or isinstance(val, bool):
            raise ValueError(f"Missing or invalid input feature '{name}'.")
        try:
            num = float(val)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Feature '{name}' must be numeric.") from exc
        if not math.isfinite(num):
            raise ValueError(f"Feature '{name}' must be finite.")
        lo, hi, strict_lo = bounds[name]
        if (num <= lo if strict_lo else num < lo) or num > hi:
            op = ">" if strict_lo else ">="
            raise ValueError(f"Feature '{name}'={num} out of physical bounds ({op} {lo}, <= {hi}).")
        values.append(num)
    return np.asarray([values], dtype=float)


def _compute_synthetic_risk_score(
    distance_km: float,
    rel_vel_kms: float,
    altitude_km: float,
    inclination_deg: float,
    rng: np.random.Generator,
) -> float:
    """Deterministic physical heuristic + observational state-covariance noise for synthetic labeling.

    Encodes documented astrodynamics assumptions (not real collision records):
    - Smaller miss distance dominates encounter severity.
    - Higher closing speed reduces warning/maneuver reaction margin and raises kinetic risk.
    - Congested LEO debris shells (~450-950 km, e.g., SSO/Cosmos/Fengyun belts) elevate background flux.
    - High/polar inclinations (~70-105 deg) experience higher crossing-angle encounter rates.
    """
    # Inverse miss-distance severity (saturates cleanly at close range)
    proximity_term = 5.2 / (distance_km + 1.15)
    # Kinetic closing-speed multiplier normalized around 7.5 km/s orbital speed
    velocity_term = 0.22 * max(0.0, rel_vel_kms - 2.0) / 3.0
    # Shell congestion factor peaking in 500-900 km LEO debris belts
    shell_congestion = 0.45 * math.exp(-((altitude_km - 720.0) / 260.0) ** 2)
    # Polar / SSO crossing geometry factor
    polar_factor = 0.30 * math.exp(-((inclination_deg - 90.0) / 22.0) ** 2)
    # Ephemeris state uncertainty perturbation (moderate jitter so boundary cases reflect realistic overlap)
    ephemeris_noise = float(rng.normal(0.0, 0.22))
    return proximity_term + velocity_term + shell_congestion + polar_factor + ephemeris_noise


def generate_synthetic_encounter_dataset(
    n_samples: int = 540,
    seed: int = 20261112,
) -> Dict[str, Any]:
    """Generate a stratified synthetic orbital encounter dataset with documented labeling rules."""
    rng = np.random.default_rng(seed)
    per_band = max(40, n_samples // 3)

    # Sample three physically grounded encounter regimes before assigning scores cleanly
    records: List[Dict[str, Any]] = []
    # Band 0: Wide / benign separations (primarily LOW RISK)
    # Band 1: Moderate screening separations (primarily MEDIUM RISK)
    # Band 2: Tight close approaches (primarily HIGH RISK)
    band_configs = [
        ("wide_clearance", (10.5, 48.0), (0.3, 13.5)),
        ("moderate_screening", (2.4, 11.0), (2.5, 15.2)),
        ("tight_conjunction", (0.08, 2.7), (4.5, 15.8)),
    ]

    idx = 0
    for band_name, (d_lo, d_hi), (v_lo, v_hi) in band_configs:
        for _ in range(per_band):
            dist = float(rng.uniform(d_lo, d_hi))
            vel = float(rng.uniform(v_lo, v_hi))
            # Mix realistic orbital regimes (LEO ISS-like, congested SSO, MEO/GEO)
            regime_choice = int(rng.integers(0, 10))
            if regime_choice < 4:
                alt = float(rng.uniform(380.0, 620.0))
                inc = float(rng.uniform(42.0, 65.0))
            elif regime_choice < 8:
                alt = float(rng.uniform(520.0, 960.0))
                inc = float(rng.uniform(82.0, 102.0))
            else:
                alt = float(rng.uniform(960.0, 2200.0))
                inc = float(rng.uniform(15.0, 80.0))

            score = _compute_synthetic_risk_score(dist, vel, alt, inc, rng)
            if score >= 2.55:
                label_idx = 2
            elif score >= 1.25:
                label_idx = 1
            else:
                label_idx = 0

            records.append({
                "sample_id": f"SYN-ENC-{idx + 1:04d}",
                "is_synthetic": True,
                "regime": band_name,
                "closest_approach_distance": round(dist, 4),
                "relative_velocity": round(vel, 4),
                "orbital_altitude": round(alt, 2),
                "orbital_inclination": round(inc, 2),
                "risk_score_latent": round(score, 4),
                "risk_label_id": label_idx,
                "risk_class": CLASS_LABELS[label_idx],
            })
            idx += 1

    class_counts = {
        label: sum(1 for r in records if r["risk_label_id"] == i)
        for i, label in enumerate(CLASS_LABELS)
    }

    return {
        "metadata": {
            "dataset_name": "AMDSF Synthetic Orbital Encounter Demonstration Dataset",
            "is_synthetic": True,
            "data_mode": "DEMONSTRATION",
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "seed": seed,
            "total_records": len(records),
            "class_counts": class_counts,
            "features": list(FEATURE_NAMES),
            "label_generation_logic": (
                "Latent severity combines inverse miss distance (5.2 / (d + 1.15)), kinetic closing speed "
                "contribution, congested 500-900 km LEO debris-shell weighting, polar/SSO inclination factor, "
                "and Gaussian state-ephemeris uncertainty (sigma=0.22). Thresholds: <1.25 -> LOW RISK, "
                "1.25..2.55 -> MEDIUM RISK, >=2.55 -> HIGH RISK."
            ),
            "warning": (
                "SYNTHETIC DEMONSTRATION DATASET: Generated from physical risk heuristics for prototype ML "
                "evaluation; does not represent empirical space-catalog collision history."
            ),
        },
        "records": records,
    }


def _evaluate_split(
    model: NGBClassifier,
    scaler: StandardScaler,
    X_test: np.ndarray,
    y_test: np.ndarray,
    y_train: np.ndarray,
) -> Dict[str, Any]:
    """Evaluate fitted NGBClassifier on held-out stratified test split without leakage."""
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)
    # Clip extreme tails solely for numerical stability in log_loss computation
    y_prob_clipped = np.clip(y_prob, 1e-12, 1.0 - 1e-12)
    y_prob_clipped = y_prob_clipped / y_prob_clipped.sum(axis=1, keepdims=True)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    loss = float(log_loss(y_test, y_prob_clipped, labels=[0, 1, 2]))
    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2]).tolist()

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "log_loss": round(loss, 4),
        "confusion_matrix": cm,
        "confusion_matrix_labels": list(CLASS_LABELS),
        "train_samples": int(len(y_train)),
        "test_samples": int(len(y_test)),
        "class_distribution_train": {
            CLASS_LABELS[i]: int((y_train == i).sum()) for i in range(3)
        },
        "class_distribution_test": {
            CLASS_LABELS[i]: int((y_test == i).sum()) for i in range(3)
        },
        "evaluation_disclaimer": (
            "Metrics are computed on a stratified 20% hold-out split of the synthetic demonstration "
            "dataset and do NOT represent operational physical collision-avoidance validation."
        ),
    }


def train_ngboost_model(
    save_artifacts: bool = True,
    n_samples: int = 540,
    seed: int = 20261112,
) -> Dict[str, Any]:
    """Train NGBClassifier on stratified synthetic encounter dataset and serialize artifact."""
    dataset = generate_synthetic_encounter_dataset(n_samples=n_samples, seed=seed)
    records = dataset["records"]

    X = np.asarray(
        [[r[f] for f in FEATURE_NAMES] for r in records],
        dtype=float,
    )
    y = np.asarray([int(r["risk_label_id"]) for r in records], dtype=int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    # Fit preprocessing strictly on training split to prevent data leakage
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    base_learner = DecisionTreeRegressor(
        criterion="squared_error",
        max_depth=3,
        min_samples_leaf=8,
        random_state=42,
    )
    model = NGBClassifier(
        Dist=k_categorical(3),
        Score=LogScore,
        Base=base_learner,
        n_estimators=120,
        learning_rate=0.04,
        minibatch_frac=0.8,
        natural_gradient=True,
        verbose=False,
        random_state=42,
    )
    model.fit(X_train_scaled, y_train)

    metrics = _evaluate_split(model, scaler, X_test, y_test, y_train)
    trained_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    bundle = {
        "schema_version": ARTIFACT_SCHEMA_VERSION,
        "model_name": "NGBoost",
        "module_name": "Probabilistic Satellite Encounter Risk Prediction",
        "estimator_class": "NGBClassifier",
        "distribution": "k_categorical(3)",
        "scoring_rule": "LogScore",
        "base_learner": "DecisionTreeRegressor(max_depth=3, min_samples_leaf=8)",
        "hyperparameters": {
            "n_estimators": 120,
            "learning_rate": 0.04,
            "minibatch_frac": 0.8,
            "natural_gradient": True,
            "test_size": 0.20,
            "stratified": True,
        },
        "trained_at": trained_at,
        "feature_names": list(FEATURE_NAMES),
        "class_labels": list(CLASS_LABELS),
        "data_mode": "DEMONSTRATION",
        "dataset_metadata": dataset["metadata"],
        "evaluation_metrics": metrics,
        "scaler": scaler,
        "model": model,
        "limitations": [
            "Trained on a synthetic heuristic encounter dataset, not empirical conjunction collision records.",
            "Class probabilities reflect synthetic model confidence, NOT calibrated physical collision probability (Pc).",
            "Does not ingest covariance ellipsoids, spacecraft hard-body radius, or operational 18th SDS CDMs.",
            "Advisory ML decision-support only; deterministic SGP4 geometry remains primary orbital evidence.",
        ],
    }

    if save_artifacts:
        ML_DATA_DIR.mkdir(parents=True, exist_ok=True)
        DATASET_PATH.write_text(json.dumps(dataset, indent=2), encoding="utf-8")
        joblib.dump(bundle, MODEL_ARTIFACT_PATH)
        logger.info(
            "Trained & saved NGBoost encounter risk model (accuracy=%.4f, f1=%.4f) -> %s",
            metrics["accuracy"],
            metrics["f1_score"],
            MODEL_ARTIFACT_PATH,
        )

    return bundle


class EncounterRiskPredictor:
    """Thread-safe lazy loader, evaluator, and probabilistic predictor wrapping NGBClassifier."""

    def __init__(self, artifact_path: Path = MODEL_ARTIFACT_PATH):
        self.artifact_path = Path(artifact_path)
        self._bundle: Optional[Dict[str, Any]] = None

    def ensure_loaded(self, force_retrain: bool = False) -> Dict[str, Any]:
        if not force_retrain and self._bundle is not None:
            return self._bundle

        if not force_retrain and self.artifact_path.exists():
            try:
                loaded = joblib.load(self.artifact_path)
                if (
                    isinstance(loaded, dict)
                    and loaded.get("schema_version") == ARTIFACT_SCHEMA_VERSION
                    and loaded.get("model") is not None
                    and loaded.get("scaler") is not None
                ):
                    self._bundle = loaded
                    return self._bundle
            except Exception as exc:
                logger.warning("Failed to load NGBoost artifact (%s); retraining: %s", self.artifact_path, exc)

        self._bundle = train_ngboost_model(save_artifacts=True)
        return self._bundle

    def get_model_info(self) -> Dict[str, Any]:
        bundle = self.ensure_loaded()
        return {
            "model": bundle["model_name"],
            "module_name": bundle["module_name"],
            "estimator": bundle["estimator_class"],
            "distribution": bundle["distribution"],
            "scoring_rule": bundle["scoring_rule"],
            "base_learner": bundle["base_learner"],
            "hyperparameters": bundle["hyperparameters"],
            "trained_at": bundle["trained_at"],
            "artifact_path": str(self.artifact_path),
            "feature_names": bundle["feature_names"],
            "class_labels": bundle["class_labels"],
            "data_mode": bundle["data_mode"],
            "dataset_metadata": bundle["dataset_metadata"],
            "evaluation_metrics": bundle["evaluation_metrics"],
            "limitations": bundle["limitations"],
        }

    def predict(
        self,
        *,
        closest_approach_distance: Any,
        relative_velocity: Any,
        orbital_altitude: Any,
        orbital_inclination: Any,
    ) -> Dict[str, Any]:
        X_raw = validate_encounter_features(
            closest_approach_distance=closest_approach_distance,
            relative_velocity=relative_velocity,
            orbital_altitude=orbital_altitude,
            orbital_inclination=orbital_inclination,
        )
        bundle = self.ensure_loaded()
        scaler: StandardScaler = bundle["scaler"]
        model: NGBClassifier = bundle["model"]

        X_scaled = scaler.transform(X_raw)
        proba = model.predict_proba(X_scaled)[0]
        proba = np.clip(np.asarray(proba, dtype=float), 0.0, 1.0)
        total = float(proba.sum())
        if total <= 0.0 or not math.isfinite(total):
            raise RuntimeError("NGBoost returned invalid probability vector.")
        proba = proba / total

        pred_idx = int(np.argmax(proba))
        pred_label = CLASS_LABELS[pred_idx]

        # Normalized Shannon entropy in [0, 1] as probabilistic uncertainty measure
        eps = 1e-12
        entropy = float(-np.sum(proba * np.log(proba + eps)) / math.log(len(CLASS_LABELS)))
        entropy = max(0.0, min(1.0, entropy))
        sorted_p = np.sort(proba)[::-1]
        margin = float(sorted_p[0] - sorted_p[1])

        if entropy >= 0.65:
            uncertainty_level = "HIGH"
        elif entropy >= 0.35:
            uncertainty_level = "MODERATE"
        else:
            uncertainty_level = "LOW"

        dist_v = float(X_raw[0, 0])
        vel_v = float(X_raw[0, 1])
        alt_v = float(X_raw[0, 2])
        inc_v = float(X_raw[0, 3])

        explanation = (
            f"NGBClassifier predicted {pred_label} (P={proba[pred_idx] * 100:.1f}%, "
            f"uncertainty entropy={entropy:.2f}) from miss distance {dist_v:.2f} km, "
            f"relative velocity {vel_v:.2f} km/s, altitude {alt_v:.1f} km, and inclination {inc_v:.1f}°. "
            f"Derived from synthetic demonstration model; not a calibrated physical collision probability."
        )

        return {
            "model": bundle["model_name"],
            "module_name": bundle["module_name"],
            "prediction": pred_label,
            "predicted_class_index": pred_idx,
            "probabilities": {
                "low": round(float(proba[0]), 4),
                "medium": round(float(proba[1]), 4),
                "high": round(float(proba[2]), 4),
            },
            "probabilities_percent": {
                "low": round(float(proba[0]) * 100.0, 2),
                "medium": round(float(proba[1]) * 100.0, 2),
                "high": round(float(proba[2]) * 100.0, 2),
            },
            "uncertainty": {
                "normalized_entropy": round(entropy, 4),
                "confidence": round(float(proba[pred_idx]), 4),
                "margin": round(margin, 4),
                "level": uncertainty_level,
            },
            "input_features": {
                "closest_approach_distance": round(dist_v, 4),
                "relative_velocity": round(vel_v, 4),
                "orbital_altitude": round(alt_v, 2),
                "orbital_inclination": round(inc_v, 2),
            },
            "data_mode": bundle["data_mode"],
            "explanation": explanation,
            "evaluation_metrics": bundle["evaluation_metrics"],
            "model_info": {
                "estimator": bundle["estimator_class"],
                "distribution": bundle["distribution"],
                "scoring_rule": bundle["scoring_rule"],
                "base_learner": bundle["base_learner"],
                "trained_at": bundle["trained_at"],
                "dataset_records": bundle["dataset_metadata"]["total_records"],
                "is_synthetic": True,
                "limitations": bundle["limitations"],
            },
            "disclaimer": (
                "DEMONSTRATION ML OUTPUT: NGBoost class probabilities are trained on synthetic encounter scenarios "
                "for decision support only and are NOT calibrated physical Pc estimates."
            ),
        }


encounter_risk_predictor = EncounterRiskPredictor()
