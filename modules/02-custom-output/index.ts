import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const result = await generateObject({
  model: openai("gpt-4.1"),
  system: "Eres un asistente que ayuda a crear recetas de cocina.",
  prompt: "Genera una receta para una ensalada",
  schema: z.object({
    recipe: z.object({
      name: z.string().describe("Nombre de la receta"),
      ingredients: z
        .array(z.object({ name: z.string(), amount: z.string() }))
        .describe("Lista de ingredientes con su cantidad"),
      steps: z.array(z.string()).describe("Pasos para preparar la receta"),
    }),
  }),
})
console.log("Validación por schema:")
console.log(result.object.recipe)

// const resultEnum = await generateObject({
//   model: openai("gpt-4.1"),
//   system: "Clasifica el sentimiento el tetxto para ver si es positivo, negativo o neutral.",
//   prompt: "estoy triste",
//   output: "enum",
//   enum: ["positivo", "negativo", "neutral"],
// })
// console.log("Validación por enum:")
// console.log(resultEnum.object)
