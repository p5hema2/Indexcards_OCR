from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import shutil

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
    filenames: list[str] = []

    for file in files:
        name = file.filename or f"unnamed_{len(filenames)}"
        file_path = temp_session_path / name
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        filenames.append(name)

    return UploadResponse(
        session_id=session_id,
        filenames=filenames,
        message=f"Successfully uploaded {len(filenames)} files."
    )


@router.delete("/{session_id}", status_code=204)
async def delete_session(session_id: str):
    """Delete a temp upload session and its files."""
    deleted = batch_manager.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return None
