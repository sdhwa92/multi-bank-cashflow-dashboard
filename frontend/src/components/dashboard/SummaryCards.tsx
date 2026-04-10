import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSummary } from "@/hooks/useSummary"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(amount)
}

interface SummaryCardsProps {
  accountId?: string
}

export default function SummaryCards({ accountId }: SummaryCardsProps) {
  const { summary, loading } = useSummary(accountId)

  const cards = [
    {
      title: "Net Balance",
      value: summary ? formatCurrency(summary.total_balance) : "—",
      icon: Wallet,
      description: "All time net cashflow",
    },
    {
      title: "Income This Month",
      value: summary ? formatCurrency(summary.income_this_month) : "—",
      icon: ArrowUpRight,
      description: "Credits & deposits",
      valueClass: "text-green-600",
    },
    {
      title: "Expenses This Month",
      value: summary ? formatCurrency(summary.expenses_this_month) : "—",
      icon: ArrowDownRight,
      description: "Debits & withdrawals",
      valueClass: "text-red-500",
    },
    {
      title: "Net This Month",
      value: summary ? formatCurrency(summary.net_this_month) : "—",
      icon: TrendingUp,
      description: `${summary?.total_transactions ?? "—"} total transactions`,
      valueClass: summary
        ? summary.net_this_month >= 0
          ? "text-green-600"
          : "text-red-500"
        : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.valueClass ?? ""} ${loading ? "animate-pulse text-muted-foreground" : ""}`}>
              {loading ? "..." : card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
