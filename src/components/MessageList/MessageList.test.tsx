import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MessageList } from './MessageList'

describe('MessageList', () => {
  it('renders all messages', () => {
    render(
      <MessageList
        messages={[
          {
            id: '1',
            role: 'user',
            content: 'Hola',
          },
          {
            id: '2',
            role: 'assistant',
            content: '¡Hola!',
          },
        ]}
        isLoading={false}
        assistantName="Sofía"
      />,
    )

    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('¡Hola!')).toBeInTheDocument()
  })

  it('shows the loading state with the assistant name', () => {
    render(
      <MessageList
        messages={[]}
        isLoading
        assistantName="Max"
      />,
    )

    expect(
      screen.getByText('Max está respondiendo...'),
    ).toBeInTheDocument()
  })

  it('does not show the loading state when loading is false', () => {
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        assistantName="Sofía"
      />,
    )

    expect(
      screen.queryByText('Sofía está respondiendo...'),
    ).not.toBeInTheDocument()
  })

  it('renders welcome suggestions when conversation is empty', () => {
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        assistantName="Sofía"
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: '¿Qué historia exploramos hoy?',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /buscar películas/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /recomendaciones/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /buscar libros/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /comparar historias/i,
      }),
    ).toBeInTheDocument()
  })

  it('sends the correct prompt for each welcome suggestion', async () => {
    const user = userEvent.setup()
    const onSuggestionSelect = vi.fn()

    render(
      <MessageList
        messages={[]}
        isLoading={false}
        assistantName="Sofía"
        onSuggestionSelect={onSuggestionSelect}
      />,
    )

    const suggestions = [
      {
        name: /buscar películas/i,
        prompt: 'Busca la película Interstellar en TMDB.',
      },
      {
        name: /recomendaciones/i,
        prompt:
          'Recomiéndame 5 películas de ciencia ficción bien calificadas usando TMDB.',
      },
      {
        name: /buscar libros/i,
        prompt:
          'Busca El Hobbit de J. R. R. Tolkien en Google Books.',
      },
      {
        name: /comparar historias/i,
        prompt:
          'Compara Harry Potter y la piedra filosofal en TMDB y Google Books.',
      },
    ]

    for (const suggestion of suggestions) {
      await user.click(
        screen.getByRole('button', {
          name: suggestion.name,
        }),
      )

      expect(onSuggestionSelect).toHaveBeenLastCalledWith(
        suggestion.prompt,
      )
    }

    expect(onSuggestionSelect).toHaveBeenCalledTimes(4)
  })


})
