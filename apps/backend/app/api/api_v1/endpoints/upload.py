from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import shutil
from pathlib import Path
import os

from app.services.batch_manager import batch_manager
from app.models.schemas import UploadResponse

router = APIRouter()

@router.post("/", response_model=UploadResponse)
async def upload_files(
    files: List[UploadFile] = File(...),
    session_id: Optional[str] = Form(None)
):
    """
    Upload multiple images to a temporary session.
    If session_id is not provided, a new one is generated.
    Returns session_id and filenames.
    """
    if not session_id:
        session_id = batch_manager.generate_session_id()

    temp_session_path = batch_manager.get_temp_session_path(session_id)
    filenames = []

    for file in files:
        file_path = temp_session_path / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        filenames.append(file.filename)

    return UploadResponse(
        session_id=session_id,
        filenames=filenames,
        message=f"Successfully uploaded {len(filenames)} files."
    )
