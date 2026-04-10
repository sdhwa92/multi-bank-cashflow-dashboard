import { BrowserRouter, Route, Routes } from "react-router-dom"
import AppLayout from "@/components/layout/AppLayout"
import Dashboard from "@/pages/Dashboard"
import Transactions from "@/pages/Transactions"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
