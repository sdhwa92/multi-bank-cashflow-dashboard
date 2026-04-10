import { Building2, LayoutDashboard, List, Plus, Upload } from "lucide-react"
import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAccounts } from "@/hooks/useAccounts"
import type { Account } from "@/types"
import AddAccountDialog from "@/components/accounts/AddAccountDialog"
import UploadStatementDialog from "@/components/accounts/UploadStatementDialog"

interface SidebarProps {
  selectedAccountId?: string
  onSelectAccount: (id: string | undefined) => void
}

export default function Sidebar({ selectedAccountId, onSelectAccount }: SidebarProps) {
  const { accounts, createAccount, refetch } = useAccounts()
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<Account | null>(null)

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r bg-card">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Building2 className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Cashflow Dashboard</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`
          }
        >
          <List className="h-4 w-4" />
          Transactions
        </NavLink>
      </nav>

      {/* Accounts */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-1 flex items-center justify-between px-3 py-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Accounts
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowAddAccount(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {accounts.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">No accounts yet</p>
        )}

        {accounts.map((account) => (
          <div
            key={account.id}
            className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
              selectedAccountId === account.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() =>
              onSelectAccount(selectedAccountId === account.id ? undefined : account.id)
            }
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{account.bank_name}</p>
              <p className="truncate text-xs text-muted-foreground">{account.account_name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setUploadTarget(account)
              }}
            >
              <Upload className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setShowAddAccount(true)}
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {showAddAccount && (
        <AddAccountDialog
          onClose={() => setShowAddAccount(false)}
          onCreated={createAccount}
        />
      )}

      {uploadTarget && (
        <UploadStatementDialog
          account={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onUploaded={refetch}
        />
      )}
    </aside>
  )
}
