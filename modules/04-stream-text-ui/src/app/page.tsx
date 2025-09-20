"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"

export default function Chat() {
  const [input, setInput] = useState("")
  const { messages, sendMessage } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-10 pb-4 flex items-center gap-3">
        <img src="/globe.svg" alt="Logo" className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Tech Caribe Fest AI Chat
        </h1>
      </header>

      {/* Chat area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pb-36">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-zinc-400 mt-20 text-lg">
              ¡Empieza la conversación!
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-md whitespace-pre-wrap text-base font-medium transition-all
                  ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-md border border-zinc-200 dark:border-zinc-700"
                  }
                `}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return <span key={`${message.id}-${i}`}>{part.text}</span>
                  }
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <form
        className="fixed bottom-0 left-0 w-full flex justify-center bg-gradient-to-t from-white/90 dark:from-zinc-950/90 via-white/60 dark:via-zinc-900/60 to-transparent py-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) return
          sendMessage({ text: input })
          setInput("")
        }}
      >
        <div className="w-full max-w-2xl flex items-center gap-2 px-4">
          <input
            className="flex-1 px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 text-zinc-800 dark:text-zinc-100 text-base transition-all"
            value={input}
            placeholder="Escribe tu mensaje..."
            onChange={(e) => setInput(e.currentTarget.value)}
            autoFocus
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim()}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
