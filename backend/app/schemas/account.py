import uuid
from datetime import datetime

from pydantic import BaseModel


class AccountCreate(BaseModel):
    bank_name: str
    account_name: str
    account_number_last4: str | None = None
    currency: str = "AUD"


class AccountResponse(BaseModel):
    id: uuid.UUID
    bank_name: str
    account_name: str
    account_number_last4: str | None
    currency: str
    created_at: datetime
    current_balance: float | None = None
    transaction_count: int = 0

    model_config = {"from_attributes": True}
