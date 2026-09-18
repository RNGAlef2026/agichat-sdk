import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../../types/chat'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <article
      className={`chat-message ${
        isUser ? 'chat-message--user' : 'chat-message--assistant'
      }`}
    >
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      )}
    </article>
  )
}