import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_statement import BankStatement
from app.models.transaction import Transaction


async def bulk_insert_transactions(
    db: AsyncSession,
    bank_account_id: uuid.UUID,
    statement_id: uuid.UUID,
    raw_transactions: list[dict[str, Any]],
) -> int:
    inserted = 0
    for tx in raw_transactions:
        try:
            # date 파싱
            date_val = _parse_date(tx.get("date", ""))
            if date_val is None:
                continue

            amount = Decimal(str(tx.get("amount", 0)))
            tx_type = "credit" if amount >= 0 else "debit"

            balance_raw = tx.get("balance")
            balance = Decimal(str(balance_raw)) if balance_raw is not None else None

            transaction = Transaction(
                bank_account_id=bank_account_id,
                statement_id=statement_id,
                date=date_val,
                description=str(tx.get("description", ""))[:500],
                amount=amount,
                transaction_type=tx_type,
                balance=balance,
                category=tx.get("category"),
            )
            db.add(transaction)
            inserted += 1
        except Exception:
            continue

    await db.commit()
    return inserted


def _parse_date(date_str: str) -> date | None:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except (ValueError, TypeError):
            continue
    return None
