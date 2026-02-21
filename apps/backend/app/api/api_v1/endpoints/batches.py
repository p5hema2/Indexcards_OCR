from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import json
import logging

from app.services.batch_manager import batch_manager
from app.services.ocr_engine import ocr_engine
from app.services.ws_manager import ws_manager
from app.models.schemas import BatchCreate, BatchResponse

logger = logging.getLogger(__name__)

router = APIRouter()

async def run_ocr_task(batch_name: str, resume: bool = True, retry_errors: bool = False):
    """Background task to run OCR on a batch."""
    try:
        batch_path = batch_manager.get_batch_path(batch_name)
        config_path = batch_path / "config.json"
        
        fields = None
        if config_path.exists():
            with open(config_path, "r") as f:
                config = json.load(f)
                fields = config.get("fields")

        # If retry_errors is True, we might want to move files back from _errors or handle them specifically.
        # For now, let's assume the retry endpoint moves them back before calling this, 
        # or OcrEngine handles it if we point it to the _errors folder.
        # The prompt says: "re-process ONLY the files in the _errors/ folder"
        
        if retry_errors:
            error_dir = batch_path / "_errors"
            if error_dir.exists():
                # Move files back to main batch dir to be processed by ocr_engine
                import shutil
                for item in error_dir.iterdir():
                    if item.is_file():
                        shutil.move(str(item), str(batch_path / item.name))
        
        await ocr_engine.process_batch(
            batch_dir=batch_path,
            fields=fields,
            progress_callback=ws_manager.broadcast_progress,
            resume=resume
        )
        
        # Mark as completed in final progress update
        # We need to know the total to send a 100% update
        # But process_batch already sends updates.
        # Let's send a final "completed" status.
        last_state = ws_manager.batch_states.get(batch_name)
        if last_state:
            last_state.status = "completed"
            await ws_manager.broadcast_progress(batch_name, last_state)
            
    except Exception as e:
        logger.exception(f"Error in background OCR task for {batch_name}: {e}")
        # Notify via WS if possible
        last_state = ws_manager.batch_states.get(batch_name)
        if last_state:
            last_state.status = "failed"
            await ws_manager.broadcast_progress(batch_name, last_state)

@router.post("/", response_model=BatchResponse)
async def create_batch(batch_data: BatchCreate):
    """
    Creates a new batch from a list of files in a temporary session.
    Moves files from temp session to a permanent batch directory.
    Returns the generated batch name.
    """
    try:
        batch_name = batch_manager.create_batch(
            custom_name=batch_data.custom_name,
            session_id=batch_data.session_id,
            fields=batch_data.fields
        )
        
        batch_path = batch_manager.get_batch_path(batch_name)
        files_count = len([f for f in batch_path.iterdir() if f.is_file() and f.suffix.lower() in [".jpg", ".jpeg"]])
        
        return BatchResponse(
            batch_name=batch_name,
            status="uploaded",
            files_count=files_count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create batch: {str(e)}")

@router.get("/", response_model=List[str])
async def list_batches():
    """
    Lists all permanent batches.
    """
    return batch_manager.list_batches()

@router.post("/{batch_name}/start")
async def start_batch(batch_name: str, background_tasks: BackgroundTasks):
    """
    Starts OCR processing for a batch.
    """
    batch_path = batch_manager.get_batch_path(batch_name)
    if not batch_path.exists():
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Check if already running? 
    # For now, let's just start it. OcrEngine with checkpointing will handle resume.
    
    background_tasks.add_task(run_ocr_task, batch_name)
    return {"message": "Batch processing started", "batch_name": batch_name}

@router.post("/{batch_name}/retry")
async def retry_batch(batch_name: str, background_tasks: BackgroundTasks):
    """
    Retries processing for failed cards in a batch.
    Moves files from _errors back to main batch dir and starts processing.
    """
    batch_path = batch_manager.get_batch_path(batch_name)
    if not batch_path.exists():
        raise HTTPException(status_code=404, detail="Batch not found")
    
    error_dir = batch_path / "_errors"
    if not error_dir.exists() or not any(error_dir.iterdir()):
        return {"message": "No failed cards to retry", "batch_name": batch_name}

    background_tasks.add_task(run_ocr_task, batch_name, retry_errors=True)
    return {"message": "Retry processing started", "batch_name": batch_name}
