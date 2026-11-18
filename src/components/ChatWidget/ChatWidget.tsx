import { useState } from 'react'
import { chatService } from '../../services/chatService'
import type {
  ChatMessage as ChatMessageType,
  ChatWidgetProps,
  NavigationAction,
} from '../../types/chat'
import { ChatHeader } from '../ChatHeader/ChatHeader'
import { ChatInput } from '../ChatInput/ChatInput'
import { MessageList } from '../MessageList/MessageList'
import './ChatWidget.css'

const INITIAL_MESSAGES: ChatMessageType[] = []

function getRequestedProvider(
  message: string,
): NavigationAction['provider'] | null {
  const normalized = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  // Rechazar solicitudes que niegan la apertura.
  const negativeRequest =
    /\b(?:no|nunca|jamas)\b.{0,60}\b(?:abre|abrir|abreme|abras|open|visita|visitar)\b/.test(
      normalized,
    )

  if (negativeRequest) {
    return null
  }

  // Reconocer solicitudes afirmativas explícitas.
  const explicitRequest =
    /^(?:por favor[\s,]*)?(?:abre|abreme|visita)\b/.test(
      normalized,
    ) ||
    /\b(?:quiero|necesito|puedes|podrias)\s+(?:que\s+)?(?:abrir|abras)\b/.test(
      normalized,
    ) ||
    /\by\s+(?:abre|abreme|visita)\b/.test(
      normalized,
    )

  if (!explicitRequest) {
    return null
  }

  if (/\bimdb\b/.test(normalized)) {
    return 'imdb'
  }

  if (/\bgoogle books\b/.test(normalized)) {
    return 'google_books'
  }

  return null
}

function isAllowedNavigation(
  action: NavigationAction,
): boolean {
  if (action.type !== 'open_reference') {
    return false
  }

  try {
    const url = new URL(action.url)

    if (url.protocol !== 'https:') {
      return false
    }

    if (url.username || url.password) {
      return false
    }

    if (action.provider === 'imdb') {
      return (
        url.origin === 'https://www.imdb.com' &&
        /^\/title\/tt\d{7,10}\/$/.test(url.pathname) &&
        !url.search &&
        !url.hash
      )
    }

    if (action.provider === 'google_books') {
      return (
        url.origin === 'https://books.google.com' &&
        url.pathname === '/books' &&
        url.searchParams.has('id')
      )
    }

    return false
  } catch {
    return false
  }
}

export function ChatWidget({
  assistantName = 'Sofía',
  description = 'Escribe una duda y yo te ayudaré en lo que pueda.',
}: ChatWidgetProps) {
  const [messages, setMessages] =
    useState<ChatMessageType[]>(INITIAL_MESSAGES)

  const [isLoading, setIsLoading] = useState(false)

  const [fallbackNavigation, setFallbackNavigation] =
    useState<NavigationAction | null>(null)

  async function handleSendMessage(content: string) {
    const requestedProvider = getRequestedProvider(content)

    // Reservar la pestaña durante la interacción del usuario.
    // No navegar todavía a ningún sitio externo.
    let reservedTab: Window | null = null

    if (requestedProvider) {
      try {
        reservedTab = window.open('about:blank', '_blank')

        if (reservedTab) {
          reservedTab.opener = null
        }
      } catch {
        reservedTab = null
      }
    }

    setFallbackNavigation(null)

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
        posterUrl: response.posterUrl,
        movieTitle: response.movieTitle,
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ])

      const navigation = response.navigation

      if (
        navigation &&
        requestedProvider === navigation.provider &&
        isAllowedNavigation(navigation)
      ) {
        if (reservedTab && !reservedTab.closed) {
          try {
            reservedTab.location.replace(navigation.url)
            reservedTab = null
          } catch {
            setFallbackNavigation(navigation)
          }
        } else {
          setFallbackNavigation(navigation)
        }
      }
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
      // Cerrar la pestaña si no hubo navegación válida.
      if (reservedTab && !reservedTab.closed) {
        reservedTab.close()
      }

      setIsLoading(false)
    }
  }

  return (
    <section
      className="chat-widget"
      aria-label={`Asistente virtual ${assistantName}`}
    >
      <ChatHeader
        assistantName={assistantName}
        description={description}
      />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        assistantName={assistantName}
        onSuggestionSelect={handleSendMessage}
      />

      {fallbackNavigation && (
        <p>
          No se pudo abrir la referencia automáticamente.{' '}
          <a
            href={fallbackNavigation.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir referencia
          </a>
        </p>
      )}

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </section>
  )
}
