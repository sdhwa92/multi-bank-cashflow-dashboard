import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransactions } from "@/hooks/useTransactions"

interface RecentTransactionsProps {
  accountId?: string
}

export default function RecentTransactions({ accountId }: RecentTransactionsProps) {
  const { transactions, loading } = useTransactions({ accountId, limit: 10 })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                  <TableCell>
                    {tx.category && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {tx.category}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.transaction_type === "credit"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {tx.transaction_type === "credit" ? "+" : ""}
                    {tx.amount.toLocaleString("en-AU", {
                      style: "currency",
                      currency: "AUD",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
