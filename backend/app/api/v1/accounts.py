import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.schemas.account import AccountCreate, AccountResponse

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountResponse])
async def list_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BankAccount).order_by(BankAccount.created_at))
    accounts = result.scalars().all()

    responses = []
    for account in accounts:
        # 트랜잭션 수
        count_result = await db.execute(
            select(func.count(Transaction.id)).where(
                Transaction.bank_account_id == account.id
            )
        )
        tx_count = count_result.scalar() or 0

        # 최신 잔액 (balance가 있는 가장 최근 트랜잭션)
        balance_result = await db.execute(
            select(Transaction.balance)
            .where(
                Transaction.bank_account_id == account.id,
                Transaction.balance.isnot(None),
            )
            .order_by(Transaction.date.desc(), Transaction.created_at.desc())
            .limit(1)
        )
        latest_balance = balance_result.scalar()

        responses.append(
            AccountResponse(
                id=account.id,
                bank_name=account.bank_name,
                account_name=account.account_name,
                account_number_last4=account.account_number_last4,
                currency=account.currency,
                created_at=account.created_at,
                current_balance=float(latest_balance) if latest_balance else None,
                transaction_count=tx_count,
            )
        )

    return responses


@router.post("", response_model=AccountResponse, status_code=201)
async def create_account(body: AccountCreate, db: AsyncSession = Depends(get_db)):
    account = BankAccount(
        bank_name=body.bank_name,
        account_name=body.account_name,
        account_number_last4=body.account_number_last4,
        currency=body.currency,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return AccountResponse(
        id=account.id,
        bank_name=account.bank_name,
        account_name=account.account_name,
        account_number_last4=account.account_number_last4,
        currency=account.currency,
        created_at=account.created_at,
        current_balance=None,
        transaction_count=0,
    )


@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BankAccount).where(BankAccount.id == account_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    await db.delete(account)
    await db.commit()
