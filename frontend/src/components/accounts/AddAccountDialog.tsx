import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AccountCreate } from "@/types"

interface AddAccountDialogProps {
  onClose: () => void
  onCreated: (body: AccountCreate) => Promise<unknown>
}

const CURRENCIES = ["AUD", "USD", "EUR", "GBP", "JPY", "KRW", "SGD", "NZD"]

export default function AddAccountDialog({ onClose, onCreated }: AddAccountDialogProps) {
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [last4, setLast4] = useState("")
  const [currency, setCurrency] = useState("AUD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bankName.trim() || !accountName.trim()) return

    setLoading(true)
    setError(null)
    try {
      await onCreated({
        bank_name: bankName.trim(),
        account_name: accountName.trim(),
        account_number_last4: last4.trim() || undefined,
        currency,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl ring-1 ring-foreground/10">
        <h2 className="mb-4 text-lg font-semibold">Add Bank Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Bank Name</label>
            <Input
              placeholder="e.g. Commonwealth Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Account Name</label>
            <Input
              placeholder="e.g. Everyday Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Last 4 digits (optional)</label>
              <Input
                placeholder="1234"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
