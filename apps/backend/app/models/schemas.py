from pydantic import BaseModel
from typing import List, Dict, Optional

class HealthCheck(BaseModel):
    status: str
    version: str

class ExtractionResult(BaseModel):
    filename: str
    batch: str
    success: bool
    data: Optional[Dict[str, str]] = None
    error: Optional[str] = None
    duration: float

class BatchConfig(BaseModel):
    fields: List[str]
    # More to follow as we develop the API

class BatchCreate(BaseModel):
    custom_name: str
    session_id: str
    fields: Optional[List[str]] = None

class BatchResponse(BaseModel):
    batch_name: str
    status: str
    files_count: int

class BatchHistory(BaseModel):
    batch_name: str
    status: str
    created_at: str
    files_count: int
    fields: List[str]

class UploadResponse(BaseModel):
    session_id: str
    filenames: List[str]
    message: str

class Template(BaseModel):
    id: str
    name: str
    fields: List[str]

class TemplateCreate(BaseModel):
    name: str
    fields: List[str]

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    fields: Optional[List[str]] = None

class BatchProgress(BaseModel):
    batch_name: str
    current: int
    total: int
    percentage: float
    eta_seconds: Optional[float] = None
    last_result: Optional[ExtractionResult] = None
    status: str # "running", "completed", "failed", "retrying"
