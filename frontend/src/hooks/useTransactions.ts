import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Transaction } from "@/types"

interface UseTransactionsOptions {
  accountId?: string
  limit?: number
  offset?: number
}

export function useTransactions({ accountId, limit = 50, offset = 0 }: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    const params = new URLSearchParams()
    if (accountId) params.set("account_id", accountId)
    params.set("limit", String(limit))
    params.set("offset", String(offset))

    setLoading(true)
    try {
      const data = await api.get<Transaction[]>(`/api/v1/transactions?${params}`)
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }, [accountId, limit, offset])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, refetch: fetchTransactions }
}
