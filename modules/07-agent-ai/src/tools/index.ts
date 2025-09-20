import { MOCK_INVOICES, MOCK_TXS } from "@/lib/mocks"
import { Invoice, Tx } from "@/types"
import { ToolSet } from "ai"
import { z } from "zod"

export const ALL_TOOLS = {
  inboxFetchInvoices: {
    name: "inbox.fetchInvoices",
    description: "Trae PDFs/adjuntos de facturas.",
    inputSchema: z.object({ sinceDays: z.number().default(30) }),
    async execute() {
      return {
        files: MOCK_INVOICES.map((i) => ({
          id: i.number,
          name: `${i.number}.pdf`,
          bytes: new Uint8Array(),
          source: "mock",
        })),
      }
    },
  },
  pdfExtract: {
    name: "pdf.extract",
    description: "Extrae datos de factura desde PDF.",
    inputSchema: z.object({ fileId: z.string() }),
    async execute({ fileId }: { fileId: string }) {
      const inv = MOCK_INVOICES.find((x) => x.number === fileId)!
      return { invoice: inv }
    },
  },
  erpSync: {
    name: "erp.sync",
    description: "Crea/actualiza factura en ERP.",
    inputSchema: z.object({
      invoice: z.any(),
      erp: z.enum(["quickbooks", "xero", "siigo"]).default("quickbooks"),
    }),
    async execute({ invoice }: any) {
      return { erpId: `erp_${invoice.number}`, status: "created" }
    },
  },
  reconcileMatch: {
    name: "reconcile.match",
    description: "Concilia pagos con facturas.",
    inputSchema: z.object({
      invoices: z.array(z.any()),
      txs: z.array(z.any()),
    }),
    async execute({ invoices, txs }: { invoices: Invoice[]; txs: Tx[] }) {
      const matches: any[] = []
      const unmatchedInv: string[] = []
      const unmatchedTx: string[] = txs.map((t) => t.id)

      for (const inv of invoices) {
        const hit = txs.find(
          (t) =>
            Math.abs(t.amount - inv.total) < 0.01 &&
            t.ref
              ?.replace(/[^A-Z0-9]/gi, "")
              .includes(inv.number.replace(/[^A-Z0-9]/gi, ""))
        )
        if (!hit) return unmatchedInv.push(inv.number)
        matches.push({
          invoiceNo: inv.number,
          txId: hit.id,
          amount: hit.amount,
          confidence: 0.95,
        })
        unmatchedTx.splice(unmatchedTx.indexOf(hit.id), 1)
      }
      return {
        matches,
        unmatched: { invoices: unmatchedInv, txs: unmatchedTx },
      }
    },
  },

  scoreRisk: {
    name: "score.risk",
    description: "Calcula riesgo de mora (mock simple).",
    inputSchema: z.object({
      invoice: z.any(),
      daysLate: z.number().default(0),
    }),
    async execute({ invoice, daysLate }: any) {
      const base = invoice.total > 1000 ? 30 : 10
      const lateness = Math.min(daysLate * 3, 40)
      const score = Math.min(100, base + lateness)
      const risk = score >= 60 ? "high" : score >= 35 ? "mid" : "low"
      return { score, risk }
    },
  },

  collectPlan: {
    name: "collect.plan",
    description: "Genera plan y mensaje de recordatorio.",
    inputSchema: z.object({
      invoice: z.any(),
      risk: z.enum(["low", "mid", "high"]),
      locale: z.enum(["es", "en"]).default("es"),
    }),
    async execute({ invoice, risk, locale }: any) {
      const tone =
        risk === "high"
          ? "formal y urgente"
          : risk === "mid"
          ? "cordial y claro"
          : "amable"
      const message = `Hola ${invoice.customer.name}, tenemos pendiente la factura ${invoice.number} por ${invoice.currency} ${invoice.total}. ¿Podemos ayudarte a completar el pago?`
      const schedule = [
        { at: new Date().toISOString(), channel: "email" },
        {
          at: new Date(Date.now() + 2 * 24 * 3600e3).toISOString(),
          channel: "email",
        },
        {
          at: new Date(Date.now() + 5 * 24 * 3600e3).toISOString(),
          channel: "whatsapp",
        },
      ]
      return { schedule, message, tone }
    },
  },

  cashflowForecast: {
    name: "cashflow.forecast",
    description:
      "Proyección simple de caja (entradas por vencimiento/conciliación).",
    inputSchema: z.object({
      invoices: z.array(z.any()),
      matches: z.array(z.any()),
      horizonDays: z.number().default(21),
    }),
    async execute({ invoices, matches, horizonDays }: any) {
      const today = new Date()
      const days: { date: string; in: number; out: number; balance: number }[] =
        []
      let balance = 0
      for (let d = 0; d < horizonDays; d++) {
        const dt = new Date(today.getTime() + d * 24 * 3600e3)
        const date = dt.toISOString().slice(0, 10)
        const paidToday = matches
          .map((m: any) => MOCK_TXS.find((t) => t.id === m.txId))
          .filter((t: { date: string }) => t?.date === date)
          .reduce((a: any, b: { amount: any }) => a + (b?.amount || 0), 0)
        const dueCollect = invoices
          .filter(
            (i: any) =>
              i.dueDate === date &&
              !matches.find((m: any) => m.invoiceNo === i.number)
          )
          .reduce((a: number, b: { total: number }) => a + b.total * 0.7, 0)
        const incoming = paidToday + dueCollect
        balance += incoming
        days.push({ date, in: incoming, out: 0, balance })
      }
      return {
        daily: days,
        assumptions: [
          "70% de cobro el día de vencimiento si no está conciliada",
        ],
      }
    },
  },
} satisfies ToolSet
