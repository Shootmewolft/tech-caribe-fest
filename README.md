# 🚀 Caribe Tech Fest - Launcher de Módulos

Un elegante launcher con interfaz interactiva para ejecutar los diferentes módulos del proyecto Caribe Tech Fest.

## ✨ Características

- 🎨 **Interfaz atractiva** con colores y emojis
- 🔍 **Detección automática** de módulos
- 📝 **Descripciones descriptivas** de cada módulo
- ⚡ **Ejecución rápida** con Bun
- 🛡️ **Manejo de errores** robusto

## 🚀 Uso Rápido

### Instalar dependencias:
```bash
bun install
```

### Ejecutar el launcher:
```bash
bun start
# o
bun run launcher
# o
bun run index.ts
```

## 📁 Estructura de Módulos

El launcher detecta automáticamente todos los módulos en la carpeta `modules/` que tengan un archivo `index.ts`:

```
modules/
├── 01-generate-text/     📝 Generación de texto con IA
├── 02-custom-output/     🎨 Salidas personalizadas y formateadas
├── 03-streaming-data/    🌊 Procesamiento de datos en tiempo real
├── 04-streaming-data-ui/ 💫 Interfaz para datos en streaming
├── 05-tools/            🛠️ Herramientas y utilidades
├── 06-images/           🖼️ Procesamiento y generación de imágenes
├── 07-pdf-generation/   📄 Generación de documentos PDF
└── 08-agent-ai/         🤖 Agente de inteligencia artificial
```

## 🎯 Cómo Agregar Nuevos Módulos

1. Crea una nueva carpeta en `modules/` con el formato: `XX-nombre-del-modulo/`
2. Agrega un archivo `index.ts` dentro de la carpeta
3. El launcher lo detectará automáticamente en la próxima ejecución

## 🛠️ Scripts Disponibles

- `bun start` - Ejecuta el launcher
- `bun run launcher` - Alias para ejecutar el launcher
- `bun dev` - Ejecuta el launcher en modo desarrollo con watch

## 🎨 Preview de la Interfaz

```
 ██████╗ █████╗ ██████╗ ██╗██████╗ ███████╗    ████████╗███████╗ ██████╗██╗  ██╗
██╔════╝██╔══██╗██╔══██╗██║██╔══██╗██╔════╝    ╚══██╔══╝██╔════╝██╔════╝██║  ██║
██║     ███████║██████╔╝██║██████╔╝█████╗         ██║   █████╗  ██║     ███████║
██║     ██╔══██║██╔══██╗██║██╔══██╗██╔══╝         ██║   ██╔══╝  ██║     ██╔══██║
╚██████╗██║  ██║██║  ██║██║██████╔╝███████╗       ██║   ███████╗╚██████╗██║  ██║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝       ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
                                     ███████╗███████╗███████╗████████╗
                                     ██╔════╝██╔════╝██╔════╝╚══██╔══╝
                                     █████╗  █████╗  ███████╗   ██║
                                     ██╔══╝  ██╔══╝  ╚════██║   ██║
                                     ██║     ███████╗███████║   ██║
                                     ╚═╝     ╚══════╝╚══════╝   ╚═╝

============================================================
🚀 Launcher de Módulos - Selecciona qué ejecutar
============================================================

? ¿Qué módulo deseas ejecutar?
❯ 📝 01. Generate Text - Generación de texto con IA
  🎨 02. Custom Output - Salidas personalizadas y formateadas
  🌊 03. Streaming Data - Procesamiento de datos en tiempo real
  💫 04. Streaming Data Ui - Interfaz para datos en streaming
  🛠️ 05. Tools - Herramientas y utilidades
  🖼️ 06. Images - Procesamiento y generación de imágenes
  📄 07. Pdf Generation - Generación de documentos PDF
  🤖 08. Agent Ai - Agente de inteligencia artificial
  🚪 Salir
```

## 🔧 Tecnologías Utilizadas

- **Bun** - Runtime JavaScript rápido
- **TypeScript** - Tipado estático
- **Chalk** - Colores en terminal
- **Inquirer** - Interfaz interactiva
- **Figlet** - Arte ASCII para banners

---

Este proyecto fue creado para el **Caribe Tech Fest** usando `bun init` en bun v1.2.15. [Bun](https://bun.sh) es un runtime JavaScript rápido y completo.
