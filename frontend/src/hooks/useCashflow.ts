import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Cashflow } from "@/types"

export function useCashflow(accountId?: string) {
  const [cashflow, setCashflow] = useState<Cashflow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = accountId
      ? `/api/v1/transactions/cashflow?account_id=${accountId}`
      : "/api/v1/transactions/cashflow"

    setLoading(true)
    api
      .get<Cashflow>(path)
      .then(setCashflow)
      .finally(() => setLoading(false))
  }, [accountId])

  return { cashflow, loading }
}
