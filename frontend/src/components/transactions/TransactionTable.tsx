import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransactions } from "@/hooks/useTransactions"

interface TransactionTableProps {
  accountId?: string
}

const PAGE_SIZE = 50

export default function TransactionTable({ accountId }: TransactionTableProps) {
  const [offset, setOffset] = useState(0)
  const { transactions, loading } = useTransactions({
    accountId,
    limit: PAGE_SIZE,
    offset,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No transactions found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{tx.description}</TableCell>
                    <TableCell>
                      {tx.category && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {tx.category}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.transaction_type === "credit" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {tx.transaction_type === "credit" ? "+" : ""}
                      {tx.amount.toLocaleString("en-AU", {
                        style: "currency",
                        currency: "AUD",
                      })}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {tx.balance != null
                        ? tx.balance.toLocaleString("en-AU", {
                            style: "currency",
                            currency: "AUD",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Showing {offset + 1}–{offset + transactions.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={transactions.length < PAGE_SIZE}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
