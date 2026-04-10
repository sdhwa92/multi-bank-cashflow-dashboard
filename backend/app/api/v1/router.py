from fastapi import APIRouter

from app.api.v1 import accounts, statements, transactions

router = APIRouter(prefix="/api/v1")

router.include_router(accounts.router)
router.include_router(statements.router)
router.include_router(transactions.router)
