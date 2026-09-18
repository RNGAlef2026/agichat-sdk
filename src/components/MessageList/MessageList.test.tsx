import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
      />,
    )

    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('¡Hola!')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    render(
      <MessageList
        messages={[]}
        isLoading
      />,
    )

    expect(
      screen.getByText('Sofía está respondiendo...'),
    ).toBeInTheDocument()
  })

  it('does not show the loading state when loading is false', () => {
    render(
      <MessageList
        messages={[]}
        isLoading={false}
      />,
    )

    expect(
      screen.queryByText('Sofía está respondiendo...'),
    ).not.toBeInTheDocument()
  })
})