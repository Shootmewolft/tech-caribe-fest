import { openai } from "@ai-sdk/openai"
import {
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from "ai"
import { z } from "zod"
import fs from "node:fs/promises"
import { constants as FS_CONSTANTS } from "node:fs"
import path from "node:path"
import { resolveSafe, statEntry, walk } from "@/utils/utils"

const BASE_DIR = process.cwd()

const tools = {
  getWeather: tool({
    description:
      "Obtiene el clima actual para una ubicación dada. Devuelve métricas clave para entender el clima.",
    inputSchema: z.object({
      location: z
        .string()
        .min(1, "Debes indicar una ubicación.")
        .describe("Ubicación para obtener el clima"),
    }),
    execute: async ({ location }: { location: string }) => {
      try {
        if (!process.env.WEATHER_API_KEY) {
          return {
            ok: false,
            error: "Falta WEATHER_API_KEY en variables de entorno.",
          }
        }

        const q = encodeURIComponent(location.trim())
        const url = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${q}`

        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store" as RequestCache,
        })

        const data = await res.json()

        if (!res.ok || (data && data.error)) {
          const message =
            data?.error?.message ??
            `HTTP ${res.status} ${res.statusText || ""}`.trim()
          return { ok: false, status: res.status, error: message }
        }

        return { ok: true, weather: data }
      } catch (err: any) {
        return { ok: false, error: err?.message ?? String(err) }
      }
    },
  }),

  writeFile: tool({
    description:
      "Escribe un archivo. Crea directorios intermedios si no existen.",
    inputSchema: z.object({
      relativePath: z
        .string()
        .describe("Ruta relativa dentro del directorio base"),
      content: z.string().describe("Contenido del archivo"),
      encoding: z
        .enum(["utf8", "base64"])
        .default("utf8")
        .describe("Codificación de contenido"),
      overwrite: z
        .boolean()
        .default(true)
        .describe("Si false, falla si el archivo existe"),
    }),
    execute: async ({ relativePath, content, encoding, overwrite }) => {
      const abs = resolveSafe(relativePath)
      await fs.mkdir(path.dirname(abs), { recursive: true })
      if (!overwrite) {
        try {
          await fs.access(abs, FS_CONSTANTS.F_OK)
          throw new Error("El archivo ya existe y overwrite=false")
        } catch {
          console.error("El archivo no existe, se puede crear")
        }
      }
      if (encoding === "base64") {
        await fs.writeFile(abs, Buffer.from(content, "base64"))
      } else {
        await fs.writeFile(abs, content, "utf8")
      }
      return { ok: true, wrote: await statEntry(abs) }
    },
  }),

  readFile: tool({
    description: "Lee un archivo y devuelve su contenido.",
    inputSchema: z.object({
      relativePath: z.string().describe("Ruta relativa del archivo a leer"),
      encoding: z
        .enum(["utf8", "base64"])
        .default("utf8")
        .describe("Forma de retorno del contenido"),
    }),
    execute: async ({ relativePath, encoding }) => {
      const abs = resolveSafe(relativePath)
      const buf = await fs.readFile(abs)
      const content =
        encoding === "base64" ? buf.toString("base64") : buf.toString("utf8")
      return { ok: true, file: await statEntry(abs), content, encoding }
    },
  }),

  deleteFile: tool({
    description: "Borra un archivo (no directorios).",
    inputSchema: z.object({
      relativePath: z.string().describe("Ruta relativa del archivo a borrar"),
    }),
    execute: async ({ relativePath }) => {
      const abs = resolveSafe(relativePath)
      const st = await fs.lstat(abs)
      if (!st.isFile()) throw new Error("La ruta no es un archivo")
      await fs.unlink(abs)
      return { ok: true, deleted: relativePath }
    },
  }),

  listDir: tool({
    description: "Lista el contenido de un directorio.",
    inputSchema: z.object({
      relativePath: z
        .string()
        .default(".")
        .describe("Directorio a listar (relativo)"),
      recursive: z
        .boolean()
        .default(false)
        .describe("Si true, lista recursivamente"),
      includeFiles: z.boolean().default(true),
      includeDirs: z.boolean().default(true),
      maxDepth: z
        .number()
        .int()
        .min(0)
        .default(10)
        .describe("Profundidad máxima si recursive=true"),
      includeHidden: z
        .boolean()
        .default(false)
        .describe('Incluir entradas que comienzan con "."'),
    }),
    execute: async ({
      relativePath,
      recursive,
      includeFiles,
      includeDirs,
      maxDepth,
      includeHidden,
    }) => {
      const abs = resolveSafe(relativePath)
      const results: Awaited<ReturnType<typeof statEntry>>[] = []
      if (recursive) {
        for await (const p of walk(abs, 0, maxDepth)) {
          const name = path.basename(p)
          if (!includeHidden && name.startsWith(".")) continue
          const info = await statEntry(p)
          if (
            (info.type === "file" && includeFiles) ||
            (info.type === "dir" && includeDirs)
          ) {
            results.push(info)
          }
        }
      } else {
        const entries = await fs.readdir(abs, { withFileTypes: true })
        for (const e of entries) {
          if (!includeHidden && e.name.startsWith(".")) continue
          const info = await statEntry(path.join(abs, e.name))
          if (
            (info.type === "file" && includeFiles) ||
            (info.type === "dir" && includeDirs)
          ) {
            results.push(info)
          }
        }
      }
      return {
        ok: true,
        base: path.relative(BASE_DIR, abs) || ".",
        entries: results,
      }
    },
  }),

  makeDir: tool({
    description: "Crea un directorio (recursivo).",
    inputSchema: z.object({
      relativePath: z
        .string()
        .describe("Ruta del directorio a crear (relativa)"),
    }),
    execute: async ({ relativePath }) => {
      const abs = resolveSafe(relativePath)
      await fs.mkdir(abs, { recursive: true })
      return { ok: true, dir: path.relative(BASE_DIR, abs) || "." }
    },
  }),

  exists: tool({
    description: "Verifica si una ruta existe (archivo o directorio).",
    inputSchema: z.object({
      relativePath: z.string().describe("Ruta relativa a verificar"),
    }),
    execute: async ({ relativePath }) => {
      const abs = resolveSafe(relativePath)
      try {
        const st = await fs.lstat(abs)
        return {
          ok: true,
          exists: true,
          type: st.isDirectory() ? "dir" : st.isFile() ? "file" : "other",
        }
      } catch {
        return { ok: true, exists: false, type: null }
      }
    },
  }),

  findFiles: tool({
    description:
      "Busca archivos por nombre, extensión y/o patrón dentro de un directorio (opcionalmente recursivo).",
    inputSchema: z.object({
      relativePath: z
        .string()
        .default(".")
        .describe("Directorio base (relativo)"),
      namePattern: z
        .string()
        .optional()
        .describe("Patrón RegExp para el nombre (sin flags)"),
      extension: z
        .string()
        .optional()
        .describe('Extensión sin punto, p.ej. "ts" o "md"'),
      recursive: z.boolean().default(true),
      maxDepth: z.number().int().min(0).default(10),
      includeHidden: z.boolean().default(false),
    }),
    execute: async ({
      relativePath,
      namePattern,
      extension,
      recursive,
      maxDepth,
      includeHidden,
    }) => {
      const abs = resolveSafe(relativePath)
      const regex = namePattern ? new RegExp(namePattern) : null
      const out: Awaited<ReturnType<typeof statEntry>>[] = []

      const processPath = async (p: string) => {
        const st = await fs.lstat(p)
        if (!st.isFile()) return
        const base = path.basename(p)
        if (!includeHidden && base.startsWith(".")) return
        if (
          extension &&
          path.extname(base).toLowerCase() !== `.${extension.toLowerCase()}`
        )
          return
        if (regex && !regex.test(base)) return
        out.push(await statEntry(p))
      }

      if (recursive) {
        for await (const p of walk(abs, 0, maxDepth)) {
          await processPath(p)
        }
      } else {
        const entries = await fs.readdir(abs, { withFileTypes: true })
        await Promise.all(
          entries.map(async (e) => {
            const full = path.join(abs, e.name)
            if (e.isFile()) await processPath(full)
          })
        )
      }
      return {
        ok: true,
        base: path.relative(BASE_DIR, abs) || ".",
        matches: out,
      }
    },
  }),
} satisfies ToolSet

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json()

  const result = streamText({
    model: openai("gpt-4.1"),
    system:
      "Tu eres un asistente que puede usar el sistema de archivos para:" +
      "\n- Crear, leer, borrar y listar archivos y directorios" +
      "\n- Buscar archivos por nombre, extensión y patrón" +
      "\nSiempre que sea posible, usa las herramientas para manipular el sistema de archivos en lugar de inventar respuestas." +
      "\n Todos los archivos que crees que sean markdown para que guardes la información ahí" +
      "\n Siempre que uses las herramientas, explica qué herramienta usaste y por qué." +
      "\nResponde de manera concisa y clara.",
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10), // IMPORTANTE!!!
    tools,
  })

  return result.toUIMessageStreamResponse()
}
