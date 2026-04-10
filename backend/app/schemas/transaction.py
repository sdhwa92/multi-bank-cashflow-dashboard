import uuid
from datetime import date, datetime

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: uuid.UUID
    bank_account_id: uuid.UUID
    statement_id: uuid.UUID
    date: date
    description: str
    amount: float
    transaction_type: str
    balance: float | None
    category: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SummaryResponse(BaseModel):
    total_balance: float
    income_this_month: float
    expenses_this_month: float
    net_this_month: float
    total_transactions: int


class CashflowSeries(BaseModel):
    month: str
    income: float
    expenses: float
    net: float


class CashflowResponse(BaseModel):
    series: list[CashflowSeries]
