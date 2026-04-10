import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function AppLayout() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
      />
      <main className="ml-60 flex-1 overflow-auto">
        <Outlet context={{ selectedAccountId }} />
      </main>
    </div>
  )
}
