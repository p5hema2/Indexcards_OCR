from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
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
