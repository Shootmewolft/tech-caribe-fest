"use client"

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useChat } from "@ai-sdk/react"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { Actions, Action } from "@/components/ai-elements/actions"
import { Response } from "@/components/ai-elements/response"
import {
  CopyIcon,
  GlobeIcon,
  RefreshCcwIcon,
  Sparkles,
  TriangleAlert,
} from "lucide-react"
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { Loader } from "@/components/ai-elements/loader"

const models = [
  { name: "GPT 4o", value: "openai/gpt-4o" },
  { name: "Deepseek R1", value: "deepseek/deepseek-r1" },
]

const STORAGE_KEYS = {
  model: "chat:model",
  webSearch: "chat:webSearch",
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center gap-3 py-12">
    <div className="rounded-xl border px-4 py-2 text-sm opacity-80">
      <span className="inline-flex items-center gap-2">
        <Sparkles className="size-4" />
        Tu agente está listo
      </span>
    </div>
    <h2 className="text-xl font-semibold">Chatea con tu agente de IA</h2>
    <p className="text-sm text-muted-foreground max-w-prose">
      Haz una pregunta, pega texto o adjunta archivos. Usa el botón{" "}
      <span className="font-medium">Search</span> para habilitar navegación web.
    </p>
  </div>
)

const ChatBotDemo = () => {
  const [input, setInput] = useState("")
  const [model, setModel] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.model) || models[0].value
      : models[0].value
  )
  const [webSearch, setWebSearch] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.webSearch) === "true"
      : false
  )

  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const { messages, sendMessage, status, regenerate, error } = useChat()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.model, model)
  }, [model])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.webSearch, String(webSearch))
  }, [webSearch])

  const isStreaming = status === "streaming"
  const isSubmitting = status === "submitted" || status === "streaming"

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSubmit({ text: input })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [input])

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim())
      const hasAttachments = Boolean(message.files?.length)
      if (!(hasText || hasAttachments)) return

      sendMessage(
        {
          text: message.text || "Sent with attachments",
          files: message.files,
        },
        { body: { model, webSearch } }
      )
      setInput("")
    },
    [model, webSearch, sendMessage]
  )

  const lastMessageId = messages.at(-1)?.id

  return (
    <div className="relative min-h-screen h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md border flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Agente de IA</p>
              <p className="text-xs text-muted-foreground">Marketing/Ventas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PromptInputModelSelect
              onValueChange={(value) => setModel(value)}
              value={model}
            >
              <PromptInputModelSelectTrigger aria-label="Seleccionar modelo">
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((m) => (
                  <PromptInputModelSelectItem key={m.value} value={m.value}>
                    {m.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>

            <PromptInputButton
              type="button"
              variant={webSearch ? "default" : "ghost"}
              onClick={() => setWebSearch((v) => !v)}
              aria-pressed={webSearch}
              title={webSearch ? "Web Search activado" : "Activar Web Search"}
            >
              <GlobeIcon className="size-4" />
              <span className="hidden sm:inline">Search</span>
            </PromptInputButton>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl h-[calc(100vh-56px)] px-4 pb-4 pt-2">
        <div className="flex flex-col h-full">
          <Conversation className="h-full">
            <ConversationContent>
              {messages.length === 0 && <EmptyState />}

              {messages.map((message) => {
                const sourceParts =
                  (message.parts?.filter(
                    (p) => p.type === "source-url"
                  ) as any[]) || []
                const hasSources = sourceParts.length > 0

                return (
                  <div key={message.id} className="group/message relative">
                    {message.role === "assistant" && hasSources && (
                      <Sources>
                        <SourcesTrigger count={sourceParts.length} />
                        <SourcesContent>
                          {sourceParts.map((part, i) => (
                            <Source
                              key={`${message.id}-src-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          ))}
                        </SourcesContent>
                      </Sources>
                    )}

                    {message.parts?.map((part: any, i: number) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Fragment key={`${message.id}-${i}`}>
                              <Message from={message.role}>
                                <MessageContent>
                                  <Response>{part.text}</Response>
                                </MessageContent>
                              </Message>

                              {message.role === "assistant" &&
                                message.id === lastMessageId && (
                                  <Actions className="mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                                    <Action
                                      onClick={() => regenerate()}
                                      label="Retry"
                                    >
                                      <RefreshCcwIcon className="size-3" />
                                    </Action>
                                    <Action
                                      onClick={() =>
                                        navigator.clipboard.writeText(part.text)
                                      }
                                      label="Copy"
                                    >
                                      <CopyIcon className="size-3" />
                                    </Action>
                                  </Actions>
                                )}
                            </Fragment>
                          )

                        case "reasoning":
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={
                                isStreaming &&
                                i === message.parts.length - 1 &&
                                message.id === lastMessageId
                              }
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          )

                        default:
                          return null
                      }
                    })}
                  </div>
                )
              })}

              {status === "submitted" && <Loader />}
              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-md border bg-destructive/10 p-3 text-sm">
                  <TriangleAlert className="size-4" />
                  <span>Error: {error.message ?? "Ocurrió un problema"}</span>
                </div>
              )}
            </ConversationContent>

            <ConversationScrollButton />
          </Conversation>

          {/* Prompt */}
          <PromptInput
            onSubmit={handleSubmit}
            className="mt-3"
            globalDrop
            multiple
          >
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>

              <PromptInputTextarea
                ref={inputRef}
                placeholder="Escribe tu mensaje… (Shift+Enter para nueva línea, Ctrl/Cmd+Enter para enviar)"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    handleSubmit({ text: input })
                  }
                }}
              />
            </PromptInputBody>

            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputButton
                  type="button"
                  variant={webSearch ? "default" : "ghost"}
                  onClick={() => setWebSearch((v) => !v)}
                  title={
                    webSearch ? "Web Search activado" : "Activar Web Search"
                  }
                >
                  <GlobeIcon className="size-4" />
                  <span>Search</span>
                </PromptInputButton>

                <PromptInputModelSelect
                  onValueChange={(value) => setModel(value)}
                  value={model}
                >
                  <PromptInputModelSelectTrigger aria-label="Seleccionar modelo">
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((m) => (
                      <PromptInputModelSelectItem key={m.value} value={m.value}>
                        {m.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>

              {/* Nota: solo deshabilitamos cuando realmente está enviando */}
              <PromptInputSubmit disabled={isSubmitting} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </main>
    </div>
  )
}

export default ChatBotDemo
