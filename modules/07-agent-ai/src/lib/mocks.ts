import { Invoice, Tx } from "@/types"

export const MOCK_INVOICES: Invoice[] = [
  {
    number: "F-1001",
    customer: { name: "Acme SAS", email: "ar@acme.com" },
    issueDate: "2025-08-25",
    dueDate: "2025-09-10",
    currency: "USD",
    total: 1200,
    status: "overdue",
  },
  {
    number: "F-1002",
    customer: { name: "Globex Ltd", email: "ap@globex.com" },
    issueDate: "2025-09-05",
    dueDate: "2025-09-25",
    currency: "USD",
    total: 890,
    status: "open",
  },
  {
    number: "F-1003",
    customer: { name: "Initech" },
    issueDate: "2025-09-12",
    dueDate: "2025-09-19",
    currency: "USD",
    total: 450,
    status: "open",
  },
]

export const MOCK_TXS: Tx[] = [
  {
    id: "tx_1",
    date: "2025-09-09",
    amount: 1200,
    currency: "USD",
    ref: "F-1001",
    source: "stripe",
  },
  {
    id: "tx_2",
    date: "2025-09-15",
    amount: 300,
    currency: "USD",
    ref: "ACME-RET",
    source: "bank",
  },
  {
    id: "tx_3",
    date: "2025-09-18",
    amount: 450,
    currency: "USD",
    ref: "F1003",
    source: "mp",
  },
]
