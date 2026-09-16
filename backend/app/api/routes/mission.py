from fastapi import APIRouter, HTTPException, status
from app.schemas.mission import MissionRequestSchema
from app.agents.orchestrator import orchestrator
from app.core.logging import logger

router = APIRouter(prefix="/mission", tags=["Mission Operations"])

@router.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_mission(request: MissionRequestSchema):
    """Executes multi-agent cross-domain analysis and synthesis for a given space mission request"""
    try:
        logger.info(f"Received mission analysis request: {request.mission_name} (Orbit: {request.target_orbit}km)")
        result = await orchestrator.execute_mission_analysis(request)
        return result
    except Exception as e:
        logger.error(f"Mission orchestration failure: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to orchestrate mission analysis: {str(e)}"
        )
