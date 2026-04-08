from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")

# Register sub-routers here as features are added
# Example:
# from app.api.v1 import banks, transactions
# router.include_router(banks.router)
# router.include_router(transactions.router)
