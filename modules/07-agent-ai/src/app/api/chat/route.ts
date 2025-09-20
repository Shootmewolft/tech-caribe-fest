import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai"
import { ALL_TOOLS } from "@/tools"
import { SYSTEM_PROMPT } from "@/consts"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"
import { deepseek } from "@ai-sdk/deepseek"

export const maxDuration = 3

export async function POST(req: Request) {
  const {
    messages,
    model,
    provider,
  }: {
    messages: UIMessage[]
    model: string
    provider: string
  } = await req.json()

  function getModel(provider: string, model: string) {
    switch (provider) {
      case "openai":
        return openai(model)
      case "deepseek":
        return deepseek(model)
      case "anthropic":
        return anthropic(model)
      case "google":
        return openai(model)
      default:
        return openai("gpt-4.1")
    }
  }

  const result = streamText({
    model: getModel(model, provider),
    messages: convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    tools: ALL_TOOLS,
    toolChoice: "auto",
    stopWhen: stepCountIs(10),
  })

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  })
}
