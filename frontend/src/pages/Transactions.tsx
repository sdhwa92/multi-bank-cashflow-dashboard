import { useOutletContext } from "react-router-dom"
import TransactionTable from "@/components/transactions/TransactionTable"

interface TransactionsContext {
  selectedAccountId?: string
}

export default function Transactions() {
  const { selectedAccountId } = useOutletContext<TransactionsContext>()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {selectedAccountId ? "Filtered by selected account" : "All accounts"}
        </p>
      </div>
      <TransactionTable accountId={selectedAccountId} />
    </div>
  )
}
