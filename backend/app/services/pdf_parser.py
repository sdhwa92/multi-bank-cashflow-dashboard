import io
from typing import Any

import anthropic
import pdfplumber

from app.core.config import settings

PARSE_TOOL: dict[str, Any] = {
    "name": "extract_transactions",
    "description": "Extract all transactions from bank statement text",
    "input_schema": {
        "type": "object",
        "properties": {
            "transactions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string",
                            "description": "ISO 8601 date YYYY-MM-DD",
                        },
                        "description": {"type": "string"},
                        "amount": {
                            "type": "number",
                            "description": "Negative for debits/withdrawals, positive for credits/deposits",
                        },
                        "balance": {
                            "type": ["number", "null"],
                            "description": "Running balance after transaction, null if not shown",
                        },
                        "category": {
                            "type": ["string", "null"],
                            "description": "Inferred category: Food, Transport, Utilities, Income, Transfer, Shopping, Health, Entertainment, Other",
                        },
                    },
                    "required": ["date", "description", "amount"],
                },
            }
        },
        "required": ["transactions"],
    },
}

SYSTEM_PROMPT = """You are a financial data extraction assistant.
Given raw text extracted from a bank statement PDF, extract every transaction.
Rules:
- Dates must be in YYYY-MM-DD format. Infer the year from statement context if only day/month is shown.
- Amounts: debits/withdrawals/purchases are NEGATIVE numbers. Credits/deposits/income are POSITIVE.
- Australian bank statements often use DD/MM/YYYY format — convert correctly to YYYY-MM-DD.
- Do not skip any transaction, even if the description is unclear.
- Do not hallucinate transactions that are not in the text.
- For balance: include the running balance shown after each transaction if available, otherwise null."""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages: list[str] = []
        for page in pdf.pages:
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:
                            pages.append(" | ".join(cell or "" for cell in row))
            else:
                text = page.extract_text()
                if text:
                    pages.append(text)
    return "\n".join(pages)


def parse_transactions_with_claude(raw_text: str) -> list[dict[str, Any]]:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=32000,
        system=SYSTEM_PROMPT,
        tools=[PARSE_TOOL],
        tool_choice={"type": "tool", "name": "extract_transactions"},
        messages=[
            {
                "role": "user",
                "content": f"Extract all transactions from this bank statement:\n\n{raw_text}",
            }
        ],
    ) as stream:
        response = stream.get_final_message()

    for block in response.content:
        if block.type == "tool_use" and block.name == "extract_transactions":
            return block.input.get("transactions", [])

    return []
