import uuid
from datetime import datetime

from pydantic import BaseModel


class StatementResponse(BaseModel):
    id: uuid.UUID
    bank_account_id: uuid.UUID
    filename: str
    status: str
    error_message: str | None
    uploaded_at: datetime
    parsed_at: datetime | None

    model_config = {"from_attributes": True}


class StatementStatusResponse(BaseModel):
    statement_id: uuid.UUID
    status: str
    error_message: str | None = None
