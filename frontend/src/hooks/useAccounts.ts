import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Account, AccountCreate } from "@/types"

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Account[]>("/api/v1/accounts")
      setAccounts(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const createAccount = async (body: AccountCreate): Promise<Account> => {
    const account = await api.post<Account>("/api/v1/accounts", body)
    await fetchAccounts()
    return account
  }

  const deleteAccount = async (id: string): Promise<void> => {
    await api.delete(`/api/v1/accounts/${id}`)
    await fetchAccounts()
  }

  return { accounts, loading, error, refetch: fetchAccounts, createAccount, deleteAccount }
}
