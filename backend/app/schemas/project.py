from pydantic import BaseModel
from typing import Optional


class ProjectCreateRequest(BaseModel):
    project_name: str
    description: Optional[str] = None
    project_type: str
   
    location: str
    country: str
    land_area_acres: float
    estimated_annual_credits: float