import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"

const result = await generateText({
  // model: google("gemini-2.5-flash"),
  // model: anthropic("claude-sonnet-4-20250514"),
  model: openai("gpt-4.1-nano"),
  system: "Eres wikipedia. Tu tarea será ayudar a resumir conceptos complejos de manera clara y concisa. Resume en máximo 20 palabras.",
  prompt: "Qué es TypeScript?",
})

console.log(result.text)

