from fastapi import APIRouter
from app.api.routes.mission import router as mission_router
from app.api.routes.agents import router as agents_router
from app.api.routes.debris import router as debris_router
from app.api.routes.weather import router as weather_router
from app.api.routes.feasibility import router as feasibility_router
from app.api.routes.coverage import router as coverage_router

api_router = APIRouter()

api_router.include_router(mission_router)
api_router.include_router(agents_router)
api_router.include_router(debris_router)
api_router.include_router(weather_router)
api_router.include_router(feasibility_router)
api_router.include_router(coverage_router)
