
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../../types/chat'

interface ChatMessageProps {
  message: ChatMessageType
}

function isValidPosterUrl(value: string): boolean {
  try {
    const url = new URL(value)

    return (
      url.protocol === 'https:' &&
      url.hostname === 'image.tmdb.org' &&
      /^\/t\/p\/[a-zA-Z0-9]+\/[a-zA-Z0-9._-]+$/.test(url.pathname)
    )
  } catch {
    return false
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const showPoster =
    !isUser &&
    typeof message.posterUrl === 'string' &&
    isValidPosterUrl(message.posterUrl)

  return (
    <article
      className={`chat-message ${
        isUser
          ? 'chat-message--user'
          : 'chat-message--assistant'
      }`}
    >
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>

          {showPoster && (
            <img
              className="chat-movie-poster"
              src={message.posterUrl}
              alt={`Póster de ${message.movieTitle || 'la película'}`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
        </>
      )}
    </article>
  )
}
