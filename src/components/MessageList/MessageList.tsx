import type { ChatMessage as ChatMessageType } from '../../types/chat'
import { ChatMessage } from '../ChatMessage/ChatMessage'

interface MessageListProps {
  messages: ChatMessageType[]
  isLoading: boolean
}

export function MessageList({
  messages,
  isLoading,
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
          Sofía está respondiendo...
        </p>
      )}
    </section>
  )
}