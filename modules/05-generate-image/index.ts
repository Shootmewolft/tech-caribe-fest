import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import fs from "node:fs"
import path from "node:path"

const result = await generateText({
  model: google("gemini-2.5-flash-image-preview"),
  prompt:
    "Crea una imagen de un paisaje futurista con montañas y un río bajo un cielo estrellado, en estilo cyberpunk.",
})

for (const file of result.files) {
  if (file.mediaType.startsWith("image/")) {
    const timestamp = Date.now()
    const fileName = `${timestamp}.png`

    const outputDir = path.join(__dirname, "output")
    fs.mkdirSync(outputDir, { recursive: true })
    const filePath = path.join(outputDir, fileName)
    await fs.promises.writeFile(filePath, file.uint8Array)
    console.log(`Imagen guardada en: ${filePath}`)
  }
}
