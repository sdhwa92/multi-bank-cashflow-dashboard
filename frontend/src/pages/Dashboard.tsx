import { useOutletContext } from "react-router-dom"
import CashflowChart from "@/components/dashboard/CashflowChart"
import RecentTransactions from "@/components/dashboard/RecentTransactions"
import SummaryCards from "@/components/dashboard/SummaryCards"

interface DashboardContext {
  selectedAccountId?: string
}

export default function Dashboard() {
  const { selectedAccountId } = useOutletContext<DashboardContext>()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {selectedAccountId ? "Filtered by selected account" : "All accounts"}
        </p>
      </div>
      <SummaryCards accountId={selectedAccountId} />
      <CashflowChart accountId={selectedAccountId} />
      <RecentTransactions accountId={selectedAccountId} />
    </div>
  )
}
