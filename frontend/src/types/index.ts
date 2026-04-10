export interface Account {
  id: string
  bank_name: string
  account_name: string
  account_number_last4: string | null
  currency: string
  created_at: string
  current_balance: number | null
  transaction_count: number
}

export interface AccountCreate {
  bank_name: string
  account_name: string
  account_number_last4?: string
  currency: string
}

export interface Statement {
  id: string
  bank_account_id: string
  filename: string
  status: string
  error_message: string | null
  uploaded_at: string
  parsed_at: string | null
}

export interface StatementStatus {
  statement_id: string
  status: string
  error_message?: string | null
}

export interface Transaction {
  id: string
  bank_account_id: string
  statement_id: string
  date: string
  description: string
  amount: number
  transaction_type: "debit" | "credit"
  balance: number | null
  category: string | null
  created_at: string
}

export interface Summary {
  total_balance: number
  income_this_month: number
  expenses_this_month: number
  net_this_month: number
  total_transactions: number
}

export interface CashflowSeries {
  month: string
  income: number
  expenses: number
  net: number
}

export interface Cashflow {
  series: CashflowSeries[]
}
