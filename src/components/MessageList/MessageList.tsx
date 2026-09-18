import type { ChatMessage as ChatMessageType } from '../../types/chat'
import { ChatMessage } from '../ChatMessage/ChatMessage'

interface MessageListProps {
  messages: ChatMessageType[]
  isLoading: boolean
  assistantName: string
}

export function MessageList({
  messages,
  isLoading,
  assistantName,
}: MessageListProps) {
  return (
    <section
      className="message-list"
      aria-label="Conversación"
      aria-live="polite"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isLoading && (
        <p className="message-list__loading">
          {assistantName} está respondiendo...
        </p>
      )}
    </section>
  )
}