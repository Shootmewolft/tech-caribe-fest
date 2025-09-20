import { google } from "@ai-sdk/google"
import { streamObject } from "ai"
import { z } from "zod"

const result = streamObject({
  model: google("gemini-2.5-flash"),
  prompt: "Dame una lista de ingredientes para una ensalada, quiero minimo 25",
  schema: z.object({
    ingredients: z
      .array(z.string())
      .describe("Lista de ingredientes con su cantidad"),
  }),
})

for await (const chunk of result.partialObjectStream) {
  console.log(chunk)
}
