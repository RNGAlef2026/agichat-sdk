import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  it('allows the user to type a message', async () => {
    const user = userEvent.setup()

    render(<ChatInput onSendMessage={vi.fn()} />)

    const input = screen.getByPlaceholderText('Escribe un mensaje...')

    await user.type(input, 'Hola Sofía')

    expect(input).toHaveValue('Hola Sofía')
  })

  it('sends a trimmed message and clears the input', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(<ChatInput onSendMessage={onSendMessage} />)

    const input = screen.getByPlaceholderText('Escribe un mensaje...')

    await user.type(input, '   Hola Sofía   ')
    await user.click(
      screen.getByRole('button', {
        name: 'Enviar mensaje',
      }),
    )

    expect(onSendMessage).toHaveBeenCalledOnce()
    expect(onSendMessage).toHaveBeenCalledWith('Hola Sofía')
    expect(input).toHaveValue('')
  })

  it('does not send an empty message', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(<ChatInput onSendMessage={onSendMessage} />)

    const button = screen.getByRole('button', {
      name: 'Enviar mensaje',
    })

    expect(button).toBeDisabled()

    await user.click(button)

    expect(onSendMessage).not.toHaveBeenCalled()
  })

  it('disables the input while loading', () => {
    render(
      <ChatInput
        onSendMessage={vi.fn()}
        disabled
      />,
    )

    expect(
      screen.getByPlaceholderText('Escribe un mensaje...'),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Enviar mensaje',
      }),
    ).toBeDisabled()
  })
})