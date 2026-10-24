/**
 * AMDSF DECISION PIPELINE ARCHITECTURE SPECIFICATION
 * ISO/IEEE 42010 Systems Architecture Standard
 * Traceable Multi-Agent Flow for Space Mission Decision Support
 */

export const PIPELINE_STAGES = [
  {
    id: 'profile',
    num: '01',
    tag: 'INPUT',
    title: 'Mission Profile',
    sub: 'Orbit, Target, Constraints',
    route: '/planning',
    routeLabel: 'Configure in Mission Planning',
    color: 'cyan',
    badgeClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
    iconName: 'FileText',
    summary: 'Operator-specified orbital parameters, geographic target requirements, and flight constraints.',
    purpose: 'Ingest, sanitize, and validate user-specified mission directives, target coverage geometry, orbital insertion parameters, payload mass properties, and budgetary limits into standardized, schema-compliant mission metadata under ISO/IEEE 42010 architecture guidelines.',
    inputs: [
      { name: 'Orbital Parameters', desc: 'Semi-major axis / altitude (h = 200–1200 km), inclination (i = 0°–98.2° SSO), eccentricity (e ≈ 0), RAAN (Ω).' },
      { name: 'Target Geometry', desc: 'Geographic bounding polygon, latitude/longitude bounds, minimum required ground coverage threshold (C_req ≥ 85%).' },
      { name: 'Mission Constraints', desc: 'Preferred launch epoch window (T₀), payload wet mass (m_wet), vehicle budget ceiling (MUSD), and risk tolerance ceiling.' }
    ],
    processing: [
      { step: 'Schema Normalization', desc: 'Type validation, range clamping, and boundary checks using Pydantic v2 validator engines.' },
      { step: 'Orbital Pre-Screening', desc: 'Ballistic coefficient estimation and preliminary orbital lifetime decay rate evaluation.' },
      { step: 'Frame Transformation', desc: 'Initial state vector generation in Earth-Centered Inertial (ECI J2000) and Earth-Centered Earth-Fixed (ECEF WGS84) frames.' }
    ],
    outputs: [
      { name: 'MissionRequestSchema', desc: 'Validated, immutable mission metadata object ready for concurrent multi-agent ingestion.' },
      { name: 'Coordinate Bounds', desc: 'Target area polygon bounding box and nominal Keplerian state vectors (r₀, v₀).' },
      { name: 'Constraint Envelope', desc: 'Parametric boundary constraints distributed to downstream evaluation agents.' }
    ],
    algorithms: [
      { name: 'Two-Body Keplerian Orbit State Vector Propagation', formula: 'r̈ = -μ/r³ · r', desc: 'Determines baseline unperturbed position and velocity vectors over the target epoch.' },
      { name: 'WGS84 ↔ ECI J2000 Coordinate Frame Rotation', formula: 'r_ECI = R_z(-θ_GST) · r_ECEF', desc: 'Transforms terrestrial target coordinates into celestial inertial coordinates.' },
      { name: 'Pydantic Schema Validation & Boundary Constraint Solver', formula: 'x_min ≤ x_param ≤ x_max', desc: 'Guarantees physical and financial plausibility before resource allocation.' }
    ]
  },
  {
    id: 'ingestion',
    num: '02',
    tag: 'FEEDS',
    title: 'Data Ingestion',
    sub: 'CelesTrak, NOAA, DONKI',
    route: '/debris',
    routeLabel: 'Inspect Telemetry Feeds',
    color: 'sky',
    badgeClass: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
    iconName: 'Database',
    summary: 'Asynchronous streaming ingestion of live SSA catalogs, space weather feeds, and vehicle databases.',
    purpose: 'Continuously poll, harvest, parse, and synchronize live external Space Situational Awareness (SSA), solar-terrestrial geophysical telemetry, and launch vehicle catalog feeds into localized, high-speed cached data structures.',
    inputs: [
      { name: 'CelesTrak / Space-Track GP TLEs', desc: 'Two-Line Element sets and General Perturbations ephemerides for 40,000+ active satellites and debris fragments.' },
      { name: 'NOAA SWPC Space Weather Feeds', desc: 'Real-time planetary Kp index, 10.7 cm solar radio flux (F10.7), solar wind speed, and proton density.' },
      { name: 'NASA DONKI Space Weather Alerts', desc: 'Coronal Mass Ejection (CME) transit vectors, geomagnetic storm classifications, and solar flare telemetry.' },
      { name: 'Launch Vehicle Catalog', desc: 'Performance profiles for Falcon 9, Electron, PSLV, and Ariane 6 (payload capacity vs. orbit altitude, cost curves).' }
    ],
    processing: [
      { step: 'Asynchronous Pipeline Ingestion', desc: 'Non-blocking HTTPX streaming requests with exponential backoff and rate-limiting.' },
      { step: 'Orbital Shell Proximity Filtering', desc: 'Discard cataloged objects with apogee/perigee outside Δh = ±50 km of target orbit to reduce downstream search space by 94%.' },
      { step: 'Data Cleansing & Interpolation', desc: 'Fill telemetry gaps with historical sliding-window averages and time-series smoothing.' }
    ],
    outputs: [
      { name: 'Filtered Debris Catalog', desc: 'Spatial neighborhood debris subset (TLEs and state vectors proximate to the mission corridor).' },
      { name: 'Solar Geophysical Matrix', desc: 'Standardized geomagnetic indices (Kp 0–9, NOAA scales G1–G5, S1–S5, R1–R5).' },
      { name: 'Booster Candidates Dataset', desc: 'Curated list of commercially available launch vehicles meeting gross payload envelope.' }
    ],
    algorithms: [
      { name: 'SGP4 / SDP4 Ephemeris Model', formula: 'r_sat(t), v_sat(t) = SGP4(TLE, t)', desc: 'Standard simplified general perturbations satellite orbit propagator accounting for Earth oblateness (J2, J3, J4).' },
      { name: 'Spatial KD-Tree / 3D R-Tree Shell Indexing', formula: 'O(log N) Spatial Pruning', desc: 'Rapidly partitions orbital space to isolate debris candidates within the orbital radius corridor.' },
      { name: 'Exponential Backoff Resilience Engine', formula: 't_wait = min(t_max, t_base · 2^attempt)', desc: 'Prevents cascade failures and external API quota exhaustion during live feed ingestion.' }
    ]
  },
  {
    id: 'agents',
    num: '03',
    tag: 'EVAL',
    title: 'Domain Agents',
    sub: 'Debris, Wx, Feas, Cov',
    route: '/weather',
    routeLabel: 'Explore Domain Intelligence',
    color: 'purple',
    badgeClass: 'text-purple-400 border-purple-500/30 bg-purple-950/40',
    iconName: 'Cpu',
    summary: 'Four concurrent domain-specialized agents executing deep physics-based risk and performance analysis.',
    purpose: 'Deploy four domain-specialized autonomous agents concurrently to evaluate conjunction collision hazards, solar-geomagnetic disturbances, propulsion/staging feasibility, and sensor swath coverage geometry.',
    inputs: [
      { name: 'Orbital Debris Agent', desc: 'Filtered debris catalog, relative velocity vectors, conjunction geometry, and miss distance thresholds.' },
      { name: 'Space Weather Agent', desc: 'Planetary Kp index, coronal mass ejection trajectory, 10.7cm solar radio flux, and ionospheric density.' },
      { name: 'Feasibility Agent', desc: 'Vehicle catalog, stage specific impulse (I_sp), payload dry/wet mass, fairing envelope, and budget ceiling.' },
      { name: 'Coverage Agent', desc: 'Sensor field-of-view (FOV), ground swath geometry, ground track trajectory, and target region polygons.' }
    ],
    processing: [
      { step: 'Parallel Agent Dispatch', desc: 'Concurrent execution of all four domain agents in isolated asynchronous event loops.' },
      { step: 'Conjunction & Miss Distance Solver', desc: 'Computes closest approach miss distance (d_miss) and collision probability (P_c) for proximate debris.' },
      { step: 'Atmospheric Drag & Radiation Modeling', desc: 'Estimates thermospheric density expansion from solar flux and evaluates single-event upset (SEU) risk.' },
      { step: 'Rocket Equation & Staging Evaluation', desc: 'Solves Tsiolkovsky staging Delta-V margins, fairing payload volume clearance, and cost variances.' },
      { step: 'Ground Track Swath Projection', desc: 'Projects satellite footprint cones onto WGS84 ellipsoid and computes geographic coverage percentages.' }
    ],
    outputs: [
      { name: 'DebrisAnalysisResult', desc: 'Total conjunction count, minimum miss distance (km), and collision risk tier (LOW/MEDIUM/HIGH).' },
      { name: 'WeatherAnalysisResult', desc: 'Kp geomagnetic index, CME storm hazard level, atmospheric drag multiplier, and weather risk tier.' },
      { name: 'FeasibilityAnalysisResult', desc: 'Selected launch vehicle, propulsion Delta-V margin (%), fairing clearance, and estimated lifecycle cost ($M).' },
      { name: 'CoverageAnalysisResult', desc: 'Target area coverage percentage (%), contact pass duration, and mean revisit interval (hours).' }
    ],
    algorithms: [
      { name: 'Foster-1992 / Akella-Alfriend Collision Probability (P_c)', formula: 'P_c = ∬_A (1 / (2π |C|^(1/2))) exp(-1/2 r^T C^(-1) r) dx dy', desc: 'Integrates probability density function over collision cross-sectional area in encounter frame.' },
      { name: 'Jacchia-Bowman / NRLMSISE-00 Upper Atmospheric Drag Model', formula: 'a_drag = -1/2 · ρ(z, F10.7, Kp) · (C_d · A / m) · v_rel · v⃗_rel', desc: 'Computes orbit decay acceleration due to thermospheric solar heating.' },
      { name: 'Tsiolkovsky Rocket Staging Equation', formula: 'ΔV_total = ∑ [I_sp,i · g₀ · ln(m_initial,i / m_final,i)]', desc: 'Calculates total velocity capability across all booster stages.' },
      { name: 'Spherical Polygon Swath Clipping & Access Calculation', formula: 'Coverage % = (Area(Footprint ∩ Target) / Area(Target)) · 100', desc: 'Computes geometric overlap of sensor optical footprint cone on Earth target region.' }
    ]
  },
  {
    id: 'evidence',
    num: '04',
    tag: 'TELEMETRY',
    title: 'Structured Evidence',
    sub: 'Normalized Risk Vectors',
    route: '/recommendation',
    routeLabel: 'View Synthesized Telemetry',
    color: 'amber',
    badgeClass: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
    iconName: 'Activity',
    summary: 'Heterogeneous metrics scaled and normalized into dimensionless risk vectors and composite readiness.',
    purpose: 'Aggregate, validate, and convert disparate heterogeneous domain outputs (ranging from kilometers and Kp integers to USD millions and coverage percentages) into standardized, dimensionless telemetry vectors suitable for multi-objective arbitration.',
    inputs: [
      { name: 'Domain Agent Results', desc: 'Raw quantitative outputs from Debris (km), Weather (Kp), Feasibility ($M, ΔV %), and Coverage (%).' },
      { name: 'Operator Weightings', desc: 'Safety priority coefficients, cost sensitivity factors, and minimum operational thresholds.' }
    ],
    processing: [
      { step: 'Non-Linear Normalization', desc: 'Maps each domain metric into a dimensionless risk score S_domain ∈ [0.0, 1.0] using calibrated sigmoid and min-max functions.' },
      { step: 'Composite Readiness Indexing', desc: 'Computes multi-domain readiness score: Readiness = (1 - S_debris)·30 + (1 - S_wx)·25 + S_feas·25 + S_cov·20.' },
      { step: 'Cross-Domain Conflict Flagging', desc: 'Detects binding incompatibilities (e.g., high orbital debris density coinciding with favorable launch weather).' },
      { step: 'Cryptographic Evidence Packaging', desc: 'Binds telemetry snapshot into an immutable ISO/IEEE 42010 audit token with cryptographic timestamps.' }
    ],
    outputs: [
      { name: 'Normalized Risk Vector', desc: 'Dimensionless 4D state vector: V_risk = [R_debris, R_wx, R_feas, R_cov] where each component ∈ [0, 1].' },
      { name: 'Mission Readiness Index', desc: 'Composite percentage metric (35%–98%) indicating overall mission execution readiness.' },
      { name: 'Binding Constraints Matrix', desc: 'Identifies active operational bottlenecks and strict physical constraints requiring arbitration.' }
    ],
    algorithms: [
      { name: 'Dimensionless Sigmoidal Risk Normalization', formula: 'S(x) = 1 / (1 + exp(-k(x - x₀)))', desc: 'Maps unbounded physical measurements to normalized [0, 1] risk scales with steep threshold penalties.' },
      { name: 'Multi-Attribute Utility Theory (MAUT) Aggregator', formula: 'U(X) = ∑ [w_i · u_i(x_i)], ∑ w_i = 1', desc: 'Synthesizes multi-domain utility functions into a singular decision metric.' },
      { name: 'ISO/IEEE 42010 Architectural Evidence Checksum', formula: 'Token = SHA-256(Profile || Telemetry || Timestamp)', desc: 'Guarantees audit traceability for mission flight readiness reviews.' }
    ]
  },
  {
    id: 'orchestration',
    num: '05',
    tag: 'SOLVER',
    title: 'Pareto Orchestration',
    sub: 'Multi-Objective Arbitration',
    route: '/recommendation',
    routeLabel: 'Examine Pareto Frontier',
    color: 'indigo',
    badgeClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40',
    iconName: 'Scale',
    summary: 'Multi-objective trade-off solver filtering candidate windows to identify non-dominated Pareto solutions.',
    purpose: 'Perform rigorous mathematical arbitration across conflicting multi-domain objectives, eliminating dominated launch candidates and identifying the non-dominated Pareto frontier across orbital phase offsets and epoch windows.',
    inputs: [
      { name: 'Candidate Solution Space', desc: 'Discretized candidate launch windows (Candidate A, Candidate B, Candidate C across T₀ epochs and RAAN phase shifts).' },
      { name: '4D Normalized Risk Vectors', desc: 'Multi-objective evaluation scores across Debris Safety, Weather Quality, Feasibility Margin, and Coverage Efficiency.' },
      { name: 'Mission Governance Rules', desc: 'Hard constraint bounds (e.g., zero tolerance for high conjunction risk, strict budget ceiling).' }
    ],
    processing: [
      { step: 'Pareto Dominance Sorting', desc: 'A candidate x₁ dominates x₂ iff x₁ is strictly better in at least one objective and no worse in all others.' },
      { step: 'Dominated Solution Pruning', desc: 'Discards sub-optimal candidates (e.g., Candidate A dominated by severe conjunction risk despite rapid launch epoch).' },
      { step: 'Trade-Off Arbitration Matrix', desc: 'Analyzes marginal exchange rates (e.g., spending 6% propellant reserve ΔV to achieve +38% debris miss distance clearance).' },
      { step: 'Sensitivity & Robustness Sweep', desc: 'Perturbs solar wind and debris ephemeris bounds to ensure stability of the Pareto set.' }
    ],
    outputs: [
      { name: 'Pareto-Optimal Frontier Set', desc: 'Curated non-dominated candidate launch windows (Candidate B recommended, Candidate C alternative).' },
      { name: 'Trade-Off Rationales', desc: 'Explicit mathematical justifications explaining why one candidate surpasses alternatives across conflicting axes.' },
      { name: 'Dominant Constraint Identifiers', desc: 'Flags binding operational limits (e.g., Debris clearance vs. Propulsion reserve).' }
    ],
    algorithms: [
      { name: 'Non-Dominated Sorting Heuristic (NSGA-II Selection)', formula: 'x_1 ≺ x_2 ⟺ (∀i: f_i(x_1) ≤ f_i(x_2)) ∧ (∃j: f_j(x_1) < f_j(x_2))', desc: 'Partitions candidate space into hierarchical Pareto dominance fronts.' },
      { name: 'Weighted TOPSIS (Similarity to Ideal Solution)', formula: 'C_i = S_i^- / (S_i^+ + S_i^-)', desc: 'Ranks non-dominated candidates by geometric distance to theoretical positive-ideal solution.' },
      { name: 'Cross-Domain Trade-Off Matrix Resolution', formula: 'MRS_{ij} = (∂f_i / ∂x) / (∂f_j / ∂x)', desc: 'Calculates marginal rate of substitution between mission safety and operational cost.' }
    ]
  },
  {
    id: 'recommendation',
    num: '06',
    tag: 'SYNTHESIS',
    title: 'Recommendation',
    sub: 'Non-Dominated Windows',
    route: '/recommendation',
    routeLabel: 'Open Recommendation Dossier',
    color: 'emerald',
    badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
    iconName: 'Award',
    summary: 'Explainable operational advisory synthesizing launch windows, tactical mitigations, and trade-offs.',
    purpose: 'Synthesize the mathematically derived Pareto-optimal solution into an explainable, human-readable mission advisory containing the primary launch epoch, backup slots, trade-off narratives, and tactical pre-launch mitigations.',
    inputs: [
      { name: 'Non-Dominated Pareto Candidates', desc: 'Selected primary candidate (Candidate B) and secondary alternative (Candidate C) from Stage 05.' },
      { name: 'Domain Agent Telemetry Summaries', desc: 'Specific qualitative rationale, risk levels, and quantitative margins from all 4 domain agents.' },
      { name: 'Spaceport Launch Windows', desc: 'Site-specific azimuth constraints, range safety limits, and countdown timelines.' }
    ],
    processing: [
      { step: 'Explainable AI (XAI) Synthesis', desc: 'Converts multi-objective mathematical proofs into actionable aerospace operational narratives.' },
      { step: 'Launch Window Scheduling', desc: 'Generates primary T₀ window (e.g., Preferred Epoch +1d — 10:30 UTC) and secondary fallback slots.' },
      { step: 'Tactical Mitigation Formulation', desc: 'Synthesizes domain-specific risk mitigation procedures (secondary radar passes, pre-loaded CAM delta-v vectors).' },
      { step: 'Executive Briefing Assembly', desc: 'Assembles full ISO/IEEE 42010 decision dossier with charts, trade-off comparisons, and confidence indices.' }
    ],
    outputs: [
      { name: 'Primary Launch Window Recommendation', desc: 'Specific launch epoch, orbital insertion parameters, and expected risk profile.' },
      { name: 'Explainable Reasoning Dossier', desc: 'Traceable rationale explaining why Candidate B was chosen over Candidates A and C.' },
      { name: 'Actionable Mitigation Checklist', desc: 'Step-by-step pre-launch directives (e.g., T-12h radar pass, T-3h NOAA Kp monitoring).' }
    ],
    algorithms: [
      { name: 'Explainable AI (XAI) Decision Synthesis Engine', formula: 'Narrative = Template(ReasoningRules(V_risk, Constraints))', desc: 'Translates quantitative constraint margins into clear, transparent justifications.' },
      { name: 'Multi-Window Temporal Spacing Optimizer', formula: 'ΔT_backup ≥ 24h · k, ∀ k ∈ ℕ', desc: 'Ensures backup launch slots provide sufficient time for ground crew reset and solar wind clearing.' },
      { name: 'Risk Mitigation Pre-Flight Rule Classifier', formula: 'Rule(RiskLevel_domain) → [Actionable Directives]', desc: 'Maps identified risk vectors to standardized aerospace operational checklists.' }
    ]
  },
  {
    id: 'human',
    num: '07',
    tag: 'DECISION',
    title: 'Human Approval',
    sub: 'Flight Director Authority',
    route: '/recommendation',
    routeLabel: 'Review Flight Director Controls',
    color: 'teal',
    badgeClass: 'text-teal-400 border-teal-500/30 bg-teal-950/40',
    iconName: 'UserCheck',
    summary: 'Human-in-the-Loop flight governance giving Flight Operations Director final launch authority.',
    purpose: 'Enforce strict Human-in-the-Loop (HITL) flight governance, ensuring AMDSF remains strictly an explainable decision-support framework while reserving final mission authorization and override authority for the Flight Operations Director.',
    inputs: [
      { name: 'Synthesized Mission Dossier', desc: 'Complete multi-agent evidence summary, Pareto trade-off comparisons, and risk mitigation plan.' },
      { name: 'Flight Readiness Checklist (FRR)', desc: 'Operator verification of spaceport status, range safety clearances, and satellite payload telemetry.' },
      { name: 'Command & Authorization Credentials', desc: 'Flight Director digital identity, authorization credentials, and operational authority level.' }
    ],
    processing: [
      { step: 'Flight Director Review', desc: 'Interactive review of non-dominated candidates, trade-off metrics, and domain agent warnings.' },
      { step: 'Safety Constraint Verification', desc: 'Human verification that all operational directives meet organizational flight safety standards.' },
      { step: 'Authorization State Transition', desc: 'Transitions mission status from PENDING_REVIEW to APPROVED (GO FOR LAUNCH) or REPLANNING_REQUIRED (NO-GO).' },
      { step: 'Immutable Flight Audit Logging', desc: 'Generates cryptographically signed decision token with UTC timestamp, operator ID, and selected window.' }
    ],
    outputs: [
      { name: 'Authorized Mission Order', desc: 'Official GO / NO-GO launch decision token logged to the operational flight registry.' },
      { name: 'Digital Audit Seal', desc: 'Cryptographic SHA-256 hash anchoring mission profile, multi-agent evidence, and Director signature.' },
      { name: 'Countdown State Transition', desc: 'Triggers launch sequence countdown or queues mission parameters for redesign.' }
    ],
    algorithms: [
      { name: 'Human-in-the-Loop (HITL) Safety Interlock Protocol', formula: 'State_Next = f(HITL_Input, SystemRecommendation)', desc: 'Guarantees autonomous agent recommendations cannot execute flight actions without human sign-off.' },
      { name: 'ISO/IEEE 42010 Architecture Traceability Verification', formula: 'VerifyTraceability(Profile → Feeds → Agents → Evidence → Decision)', desc: 'Validates that every decision step is bidirectionally traceable back to primary inputs.' },
      { name: 'Cryptographic Flight Order Hash Signing', formula: 'Hash_Audit = HMAC-SHA256(DecisionToken, OperatorKey)', desc: 'Generates non-repudiable audit logs complying with international aerospace safety standards.' }
    ]
  }
];

export const PIPELINE_METADATA = {
  title: 'AMDSF DECISION PIPELINE ARCHITECTURE',
  subtitle: 'Traceable Multi-Agent Flow',
  standard: 'ISO/IEEE 42010 Architecture Flow',
  description: 'An explainable, multi-agent aerospace decision-support architecture decomposing complex space mission planning into seven bidirectionally traceable stages from initial profile ingestion to Human-in-the-Loop flight authorization.',
  totalStages: 7
};
