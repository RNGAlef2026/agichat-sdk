
import type { ChatMessage as ChatMessageType } from '../../types/chat'
import { ChatMessage } from '../ChatMessage/ChatMessage'

interface MessageListProps {
  messages: ChatMessageType[]
  isLoading: boolean
  assistantName: string
  onSuggestionSelect?: (message: string) => void
}

const SUGGESTIONS = [
  {
    icon: '🎬',
    title: 'Buscar películas',
    description: 'Explora títulos en TMDB',
    prompt: 'Busca la película Interstellar en TMDB.',
  },
  {
    icon: '✨',
    title: 'Recomendaciones',
    description: 'Descubre películas por género',
    prompt:
      'Recomiéndame 5 películas de ciencia ficción bien calificadas usando TMDB.',
  },
  {
    icon: '📚',
    title: 'Buscar libros',
    description: 'Consulta Google Books',
    prompt:
      'Busca El Hobbit de J. R. R. Tolkien en Google Books.',
  },
  {
    icon: '🎭',
    title: 'Comparar historias',
    description: 'Libros y adaptaciones',
    prompt:
      'Compara Harry Potter y la piedra filosofal en TMDB y Google Books.',
  },
]

export function MessageList({
  messages,
  isLoading,
  assistantName,
  onSuggestionSelect,
}: MessageListProps) {
  const showWelcome = messages.length === 0 && !isLoading

  return (
    <section
      className="message-list"
      aria-label="Conversación"
      aria-live="polite"
    >
      {showWelcome && (
        <div className="message-list__welcome">
          <div
            className="message-list__welcome-icon"
            aria-hidden="true"
          >
            ✦
          </div>

          <h2>¿Qué historia exploramos hoy?</h2>

          <p>
            Descubre películas, encuentra libros y compara
            tus historias favoritas con {assistantName}.
          </p>

          <div className="message-list__suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                className="message-list__suggestion"
                onClick={() =>
                  onSuggestionSelect?.(suggestion.prompt)
                }
              >
                <span
                  className="message-list__suggestion-icon"
                  aria-hidden="true"
                >
                  {suggestion.icon}
                </span>

                <span className="message-list__suggestion-title">
                  {suggestion.title}
                </span>

                <span className="message-list__suggestion-description">
                  {suggestion.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
