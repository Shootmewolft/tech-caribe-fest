#!/usr/bin/env bun
import chalk from "chalk"
import inquirer from "inquirer"
import figlet from "figlet"
import { execSync } from "child_process"
import { readdirSync, statSync } from "fs"
import path from "path"

interface Module {
  name: string
  description: string
  path: string
  emoji: string
}

function scanModules(): Module[] {
  const modulesDir = path.join(__dirname, "modules")
  const modules: Module[] = []

  try {
    const entries = readdirSync(modulesDir)

    for (const entry of entries) {
      const fullPath = path.join(modulesDir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        const indexPath = path.join(fullPath, "index.ts")

        try {
          statSync(indexPath)

          const parts = entry.split("-")
          const number = parts[0]
          const nameParts = parts.slice(1)
          const name = nameParts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")

          const emoji = getEmojiForModule(entry)

          modules.push({
            name: `${number}. ${name}`,
            description: getDescriptionForModule(entry),
            path: indexPath,
            emoji,
          })
        } catch {}
      }
    }
  } catch (error) {
    console.error(chalk.red("Error escaneando módulos:"), error)
  }

  return modules.sort((a, b) => a.name.localeCompare(b.name))
}

function getEmojiForModule(moduleName: string): string {
  const emojiMap: { [key: string]: string } = {
    "generate-text": "📝",
    "custom-output": "🎨",
    "streaming-data": "🌊",
    "streaming-data-ui": "💫",
    tools: "🛠️",
    images: "🖼️",
    "pdf-generation": "📄",
    "agent-ai": "🤖",
  }

  for (const key in emojiMap) {
    if (moduleName.includes(key)) {
      return emojiMap[key] || "⚡"
    }
  }

  return "⚡"
}

// Función para obtener descripción basada en el nombre del módulo
function getDescriptionForModule(moduleName: string): string {
  const descriptionMap: { [key: string]: string } = {
    "generate-text": "Generación de texto con IA",
    "custom-output": "Salidas personalizadas y formateadas",
    "streaming-data": "Procesamiento de datos en tiempo real",
    "streaming-data-ui": "Interfaz para datos en streaming",
    tools: "Herramientas y utilidades",
    images: "Procesamiento y generación de imágenes",
    "pdf-generation": "Generación de documentos PDF",
    "agent-ai": "Agente de inteligencia artificial",
  }

  for (const key in descriptionMap) {
    if (moduleName.includes(key)) {
      return descriptionMap[key] || "Módulo del proyecto Caribe Tech Fest"
    }
  }

  return "Módulo del proyecto Caribe Tech Fest"
}

function showBanner(): void {
  console.clear()
  console.log()
  console.log(
    chalk.white(
      figlet.textSync("Caribe Fest", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  )

  console.log(chalk.gray("=".repeat(60)))
  console.log(
    chalk.white.bold("🚀 Creando agentes inteligentes con Next.js | Alvaro Pedrozo")
  )
  console.log(chalk.gray("=".repeat(60)))
  console.log()
}

async function executeModule(
  modulePath: string,
  moduleName: string
): Promise<void> {
  console.log(chalk.cyan(`\n🚀 Ejecutando: ${moduleName}`))
  console.log(chalk.gray("-".repeat(50)))

  try {
    const command = `cd "${path.dirname(__dirname)}" && bun run "${modulePath}"`

    console.log()

    execSync(command, {
      stdio: "inherit",
      encoding: "utf-8",
    })

    console.log()
  } catch (error) {
    console.log()
    console.error(chalk.red(`❌ Error ejecutando ${moduleName}:`))
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error))
    )
  }

  console.log(chalk.gray("-".repeat(50)))

  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: chalk.yellow("Presiona Enter para continuar..."),
    },
  ])
}

async function launcher(): Promise<void> {
  while (true) {
    showBanner()

    const modules = scanModules()

    if (modules.length === 0) {
      console.log(chalk.red("❌ No se encontraron módulos ejecutables"))
      console.log(
        chalk.yellow(
          "💡 Asegúrate de que existan archivos index.ts en las carpetas de módulos"
        )
      )
      return
    }

    const choices = modules.map((module) => ({
      name: `${module.emoji} ${module.name} - ${chalk.gray(
        module.description
      )}`,
      value: module,
      short: module.name,
    }))

    choices.push({
      name: `${chalk.red("🚪 Salir")}`,
      value: "exit",
      short: "Salir",
    })

    const { selectedModule }: { selectedModule: Module | "exit" } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedModule",
        message: chalk.white.bold("¿Qué módulo deseas ejecutar?"),
        choices,
        pageSize: 10,
      },
    ])

    if (selectedModule === "exit") {
      console.log(chalk.cyan("\n👋 ¡Hasta luego!"))
      break
    }

    await executeModule(selectedModule.path, selectedModule.name)
  }
}

process.on("uncaughtException", (error) => {
  console.error(chalk.red("\n💥 Error no manejado:"), error.message)
  process.exit(1)
})

process.on("unhandledRejection", (reason) => {
  console.error(chalk.red("\n💥 Promesa rechazada:"), reason)
  process.exit(1)
})

process.on("SIGINT", () => {
  console.log(chalk.cyan("\n\n👋 ¡Hasta luego!"))
  process.exit(0)
})

if (import.meta.main) {
  launcher().catch((error) => {
    console.error(chalk.red("💥 Error en el launcher:"), error)
    process.exit(1)
  })
}
