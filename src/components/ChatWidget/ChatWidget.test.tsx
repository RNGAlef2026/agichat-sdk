  import { render, screen } from '@testing-library/react'
  import userEvent from '@testing-library/user-event'
  import { beforeEach, describe, expect, it, vi } from 'vitest'
  import { chatService } from '../../services/chatService'
  import { ChatWidget } from './ChatWidget'

  vi.mock('../../services/chatService', () => ({
    chatService: {
      sendMessage: vi.fn(),
    },
  }))

  const sendMessageMock = vi.mocked(chatService.sendMessage)

  describe('ChatWidget', () => {
    beforeEach(() => {
      sendMessageMock.mockReset()
    })

    it('renders custom assistant configuration', () => {
    render(
      <ChatWidget
        assistantName="Max"
        description="Asistente personalizado"
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: /max/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Asistente personalizado'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', {
        name: 'Asistente virtual Max',
      }),
    ).toBeInTheDocument()
  })

    it('renders the assistant information', () => {
      render(<ChatWidget />)

      expect(
        screen.getByRole('heading', {
          name: /sofía/i,
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByPlaceholderText('Escribe un mensaje...'),
      ).toBeInTheDocument()
    })

    it('sends a user message and renders the assistant response', async () => {
      const user = userEvent.setup()

      sendMessageMock.mockResolvedValue({
        message: '## Respuesta\n\nTodo funciona correctamente.',
      })

      render(<ChatWidget />)

      const input = screen.getByPlaceholderText('Escribe un mensaje...')

      await user.type(input, 'Hola Sofía')
      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      expect(
        screen.getByText('Hola Sofía'),
      ).toBeInTheDocument()

      expect(sendMessageMock).toHaveBeenCalledWith('Hola Sofía')

      expect(
        await screen.findByRole('heading', {
          name: 'Respuesta',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByText('Todo funciona correctamente.'),
      ).toBeInTheDocument()
    })

    it('shows a loading state while waiting for the response', async () => {
      const user = userEvent.setup()

      let resolveRequest:
        | ((value: { message: string }) => void)
        | undefined

      sendMessageMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve
          }),
      )

      render(<ChatWidget />)

      await user.type(
        screen.getByPlaceholderText('Escribe un mensaje...'),
        'Hola',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      expect(
        screen.getByText('Sofía está respondiendo...'),
      ).toBeInTheDocument()

      expect(
        screen.getByPlaceholderText('Escribe un mensaje...'),
      ).toBeDisabled()

      resolveRequest?.({
        message: 'Respuesta',
      })

      expect(
        await screen.findByText('Respuesta'),
      ).toBeInTheDocument()
    })

    it('renders an error message when the service fails', async () => {
      const user = userEvent.setup()

      sendMessageMock.mockRejectedValue(
        new Error('Network error'),
      )

      render(<ChatWidget />)

      await user.type(
        screen.getByPlaceholderText('Escribe un mensaje...'),
        'Hola',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      expect(
        await screen.findByText('Ocurrió un error.'),
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          'No pude obtener una respuesta en este momento.',
        ),
      ).toBeInTheDocument()
    })
  })