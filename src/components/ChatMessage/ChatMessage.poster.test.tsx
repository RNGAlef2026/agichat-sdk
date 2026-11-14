
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType } from '../../types/chat'

const posterUrl =
  'https://image.tmdb.org/t/p/w500/interstellar.jpg'

function createMessage(
  overrides: Partial<ChatMessageType> = {},
): ChatMessageType {
  return {
    id: 'test-message',
    role: 'assistant',
    content: 'Te recomiendo Interstellar.',
    ...overrides,
  }
}

describe('ChatMessage poster rendering', () => {
  it('renders a valid TMDB poster', () => {
    render(
      <ChatMessage
        message={createMessage({
          posterUrl,
          movieTitle: 'Interstellar',
        })}
      />,
    )

    const poster = screen.getByRole('img', {
      name: 'Póster de Interstellar',
    })

    expect(poster).toHaveAttribute('src', posterUrl)
  })

  it('rejects posters from unauthorized domains', () => {
    render(
      <ChatMessage
        message={createMessage({
          posterUrl: 'https://example.com/poster.jpg',
          movieTitle: 'Interstellar',
        })}
      />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('rejects malformed poster URLs', () => {
    render(
      <ChatMessage
        message={createMessage({
          posterUrl: 'invalid-url',
        })}
      />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does not render posters for user messages', () => {
    render(
      <ChatMessage
        message={createMessage({
          role: 'user',
          content: 'Hola Sofía',
          posterUrl,
        })}
      />,
    )

    expect(screen.getByText('Hola Sofía')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('uses a fallback description without a movie title', () => {
    render(
      <ChatMessage
        message={createMessage({
          posterUrl,
        })}
      />,
    )

    expect(
      screen.getByRole('img', {
        name: 'Póster de la película',
      }),
    ).toBeInTheDocument()
  })
})
