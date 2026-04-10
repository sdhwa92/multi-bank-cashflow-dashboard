import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db
from app.models.bank_account import BankAccount
from app.models.bank_statement import BankStatement
from app.schemas.statement import StatementResponse, StatementStatusResponse
from app.services.pdf_parser import extract_text_from_pdf, parse_transactions_with_claude
from app.services.transaction_service import bulk_insert_transactions

router = APIRouter(tags=["statements"])


async def _process_statement(statement_id: uuid.UUID, file_bytes: bytes) -> None:
    async with AsyncSessionLocal() as db:
        # 상태를 processing으로 변경
        result = await db.execute(
            select(BankStatement).where(BankStatement.id == statement_id)
        )
        statement = result.scalar_one_or_none()
        if not statement:
            return

        statement.status = "processing"
        await db.commit()

        try:
            raw_text = extract_text_from_pdf(file_bytes)
            statement.raw_text = raw_text
            await db.commit()

            transactions = parse_transactions_with_claude(raw_text)

            await bulk_insert_transactions(
                db=db,
                bank_account_id=statement.bank_account_id,
                statement_id=statement.id,
                raw_transactions=transactions,
            )

            statement.status = "completed"
            statement.parsed_at = datetime.now(timezone.utc)
        except Exception as e:
            statement.status = "failed"
            statement.error_message = str(e)[:1000]

        await db.commit()


@router.post(
    "/accounts/{account_id}/statements/upload",
    response_model=StatementStatusResponse,
    status_code=202,
)
async def upload_statement(
    account_id: uuid.UUID,
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    # 계좌 존재 확인
    acc_result = await db.execute(
        select(BankAccount).where(BankAccount.id == account_id)
    )
    if not acc_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Account not found")

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await file.read()

    statement = BankStatement(
        bank_account_id=account_id,
        filename=file.filename,
        status="pending",
    )
    db.add(statement)
    await db.commit()
    await db.refresh(statement)

    background_tasks.add_task(_process_statement, statement.id, file_bytes)

    return StatementStatusResponse(
        statement_id=statement.id,
        status=statement.status,
    )


@router.get(
    "/accounts/{account_id}/statements",
    response_model=list[StatementResponse],
)
async def list_statements(
    account_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BankStatement)
        .where(BankStatement.bank_account_id == account_id)
        .order_by(BankStatement.uploaded_at.desc())
    )
    return result.scalars().all()


@router.get("/statements/{statement_id}/status", response_model=StatementStatusResponse)
async def get_statement_status(
    statement_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BankStatement).where(BankStatement.id == statement_id)
    )
    statement = result.scalar_one_or_none()
    if not statement:
        raise HTTPException(status_code=404, detail="Statement not found")

    return StatementStatusResponse(
        statement_id=statement.id,
        status=statement.status,
        error_message=statement.error_message,
    )
