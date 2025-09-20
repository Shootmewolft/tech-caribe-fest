import { streamText, UIMessage, convertToModelMessages } from "ai"
import { openai } from "@ai-sdk/openai"


export const maxDuration = 3

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    dialect = "postgres",
  }: {
    messages: UIMessage[]
    model: string
    webSearch: boolean
    dialect: "postgres" | "mysql" | "sqlite"
  } = await req.json()

  const system = [
    "Eres un arquitecto de datos.",
    "Objetivo: devolver SOLO un objeto JSON válido que cumpla el esquema DiagramModel.",
    "Reglas: snake_case; normaliza lo razonable; define claves primarias y FKs explícitas; ",
    "usa tipos del dialecto indicado; incluye created_at/updated_at si aplica.",
  ].join(" ")

  const result = streamText({
    model: openai("gpt-4.1"),
    messages: convertToModelMessages(messages),
    system: system,
    tools: {},
    toolChoice: "auto",
  })

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  })
}
