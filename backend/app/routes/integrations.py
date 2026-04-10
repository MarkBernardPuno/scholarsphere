from fastapi import APIRouter, Depends

from app.integrations_api import service
from database.database import get_db


router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.post("/populate-defaults")
def populate_defaults(db=Depends(get_db)):
    """Seed default lookup data (semesters, research types, output types)."""
    return service.populate_defaults(db)


@router.post("/email/test")
def email_test(recipient: str):
    """Email integration stub endpoint for external service hooks."""
    return service.email_test(recipient)
