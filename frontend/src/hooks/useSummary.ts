import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Summary } from "@/types"

export function useSummary(accountId?: string) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = accountId
      ? `/api/v1/transactions/summary?account_id=${accountId}`
      : "/api/v1/transactions/summary"

    setLoading(true)
    api
      .get<Summary>(path)
      .then(setSummary)
      .finally(() => setLoading(false))
  }, [accountId])

  return { summary, loading }
}
