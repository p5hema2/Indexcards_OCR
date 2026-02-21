from fastapi import APIRouter, HTTPException, status
from typing import List
from app.services.template_service import template_service
from app.models.schemas import Template, TemplateCreate, TemplateUpdate

router = APIRouter()

@router.get("/", response_model=List[Template])
async def list_templates():
    """
    List all field configuration templates.
    """
    return template_service.list_templates()

@router.get("/{template_id}", response_model=Template)
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    """
    template = template_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.post("/", response_model=Template, status_code=status.HTTP_201_CREATED)
async def create_template(template_in: TemplateCreate):
    """
    Create a new field configuration template.
    """
    return template_service.create_template(template_in)

@router.put("/{template_id}", response_model=Template)
async def update_template(template_id: str, template_in: TemplateUpdate):
    """
    Update an existing template.
    """
    template = template_service.update_template(template_id, template_in)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: str):
    """
    Delete a template.
    """
    success = template_service.delete_template(template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return
