import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCashflow } from "@/hooks/useCashflow"

interface CashflowChartProps {
  accountId?: string
}

function formatK(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

export default function CashflowChart({ accountId }: CashflowChartProps) {
  const { cashflow, loading } = useCashflow(accountId)

  const data = cashflow?.series.map((s) => ({
    month: s.month,
    Income: s.income,
    Expenses: s.expenses,
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cashflow</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
            No data yet. Upload a bank statement to get started.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tickFormatter={formatK}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value) => typeof value === "number" ? `$${value.toLocaleString("en-AU", { minimumFractionDigits: 2 })}` : value}
              />
              <Legend />
              <Bar dataKey="Income" fill="var(--color-chart-1, #22c55e)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--color-chart-2, #ef4444)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
