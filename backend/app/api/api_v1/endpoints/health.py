from fastapi import APIRouter
from app.models.schemas import HealthCheck
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthCheck)
def get_health():
    return HealthCheck(status="OK", version=settings.VERSION)
