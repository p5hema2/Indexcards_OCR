import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.api_v1.api import api_router
from app.core.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: clean orphaned temp sessions
    from app.services.batch_manager import batch_manager
    cleaned = batch_manager.cleanup_stale_sessions()
    if cleaned > 0:
        logger.info(f"Cleaned up {cleaned} stale temp session(s)")
    yield
    # Shutdown: nothing needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve batch images as static files so the frontend can display thumbnails.
# The mount comes AFTER include_router so API routes take priority.
batches_dir = Path(settings.BATCHES_DIR)
batches_dir.mkdir(parents=True, exist_ok=True)
app.mount("/batches-static", StaticFiles(directory=str(batches_dir)), name="batches-static")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Indexcards OCR API"}
