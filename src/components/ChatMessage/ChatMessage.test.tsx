import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatMessage } from './ChatMessage'

describe('ChatMessage', () => {
  it('renders a user message as plain text', () => {
    render(
      <ChatMessage
        message={{
          id: '1',
          role: 'user',
          content: 'Hola Sofía',
        }}
      />,
    )

    expect(
      screen.getByText('Hola Sofía'),
    ).toBeInTheDocument()
  })

  it('renders assistant Markdown correctly', () => {
    render(
      <ChatMessage
        message={{
          id: '2',
          role: 'assistant',
          content: '## Respuesta\n\nEsto es **importante**.',
        }}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Respuesta',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('importante'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('importante').tagName,
    ).toBe('STRONG')
  })
})