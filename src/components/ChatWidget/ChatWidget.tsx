import { useState } from 'react'
import { chatService } from '../../services/chatService'
import type { ChatMessage as ChatMessageType } from '../../types/chat'
import { ChatHeader } from '../ChatHeader/ChatHeader'
import { ChatInput } from '../ChatInput/ChatInput'
import { MessageList } from '../MessageList/MessageList'

import './ChatWidget.css'

const INITIAL_MESSAGES: ChatMessageType[] = []

export function ChatWidget() {
  const [messages, setMessages] =
    useState<ChatMessageType[]>(INITIAL_MESSAGES)

  const [isLoading, setIsLoading] = useState(false)

  async function handleSendMessage(content: string) {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ])

    setIsLoading(true)

    try {
      const response = await chatService.sendMessage(content)

      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ])
    } catch {
      const errorMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          '**Ocurrió un error.** No pude obtener una respuesta en este momento.',
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        errorMessage,
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      className="chat-widget"
      aria-label="Asistente virtual Sofía"
    >
      <ChatHeader
        assistantName="Sofía"
        description="Escribe una duda y yo te ayudaré en lo que pueda."
      />

      <MessageList
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </section>
  )
}