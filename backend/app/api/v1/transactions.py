import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import (
    CashflowResponse,
    CashflowSeries,
    SummaryResponse,
    TransactionResponse,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
async def list_transactions(
    account_id: uuid.UUID | None = Query(None),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Transaction).order_by(Transaction.date.desc(), Transaction.created_at.desc())

    if account_id:
        stmt = stmt.where(Transaction.bank_account_id == account_id)
    if start_date:
        stmt = stmt.where(Transaction.date >= start_date)
    if end_date:
        stmt = stmt.where(Transaction.date <= end_date)

    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/summary", response_model=SummaryResponse)
async def get_summary(
    account_id: uuid.UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    month_start = date(now.year, now.month, 1)

    base = select(Transaction)
    if account_id:
        base = base.where(Transaction.bank_account_id == account_id)

    # 전체 트랜잭션 수
    count_result = await db.execute(
        base.with_only_columns(func.count(Transaction.id))
    )
    total_tx = count_result.scalar() or 0

    # 이번 달 입금 합계 (양수 금액)
    income_result = await db.execute(
        base.with_only_columns(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.date >= month_start,
            Transaction.transaction_type == "credit",
        )
    )
    income = float(income_result.scalar() or 0)

    # 이번 달 출금 합계 (음수 금액의 절댓값)
    expense_result = await db.execute(
        base.with_only_columns(
            func.coalesce(func.sum(func.abs(Transaction.amount)), 0)
        ).where(
            Transaction.date >= month_start,
            Transaction.transaction_type == "debit",
        )
    )
    expenses = float(expense_result.scalar() or 0)

    # 총 잔액: balance가 있는 계좌별 최신 잔액 합산
    # 간단하게 전체 amount 합산으로 net 계산
    balance_result = await db.execute(
        base.with_only_columns(func.coalesce(func.sum(Transaction.amount), 0))
    )
    total_balance = float(balance_result.scalar() or 0)

    return SummaryResponse(
        total_balance=total_balance,
        income_this_month=income,
        expenses_this_month=expenses,
        net_this_month=income - expenses,
        total_transactions=total_tx,
    )


@router.get("/cashflow", response_model=CashflowResponse)
async def get_cashflow(
    account_id: uuid.UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    # 월별 입금/출금 집계
    base_filter = []
    if account_id:
        base_filter.append(Transaction.bank_account_id == account_id)

    month_expr = func.to_char(Transaction.date, "YYYY-MM")

    income_result = await db.execute(
        select(
            month_expr.label("month"),
            func.coalesce(func.sum(Transaction.amount), 0).label("income"),
        )
        .where(Transaction.transaction_type == "credit", *base_filter)
        .group_by(month_expr)
        .order_by(month_expr)
    )
    income_by_month = {row.month: float(row.income) for row in income_result}

    expense_result = await db.execute(
        select(
            month_expr.label("month"),
            func.coalesce(func.sum(func.abs(Transaction.amount)), 0).label("expenses"),
        )
        .where(Transaction.transaction_type == "debit", *base_filter)
        .group_by(month_expr)
        .order_by(month_expr)
    )
    expense_by_month = {row.month: float(row.expenses) for row in expense_result}

    all_months = sorted(set(income_by_month) | set(expense_by_month))

    series = [
        CashflowSeries(
            month=m,
            income=income_by_month.get(m, 0),
            expenses=expense_by_month.get(m, 0),
            net=income_by_month.get(m, 0) - expense_by_month.get(m, 0),
        )
        for m in all_months
    ]

    return CashflowResponse(series=series)
