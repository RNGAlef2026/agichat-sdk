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
      vi.restoreAllMocks()
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

    it('opens a valid IMDb reference automatically', async () => {
      const user = userEvent.setup()
      const replaceMock = vi.fn()
      const closeMock = vi.fn()

      const fakeTab = {
        closed: false,
        opener: null,
        location: {
          replace: replaceMock,
        },
        close: closeMock,
      } as unknown as Window

      const openMock = vi
        .spyOn(window, 'open')
        .mockReturnValue(fakeTab)

      sendMessageMock.mockResolvedValue({
        message: 'Encontré Interstellar en IMDb.',
        navigation: {
          type: 'open_reference',
          provider: 'imdb',
          url: 'https://www.imdb.com/title/tt0816692/',
        },
      })

      render(<ChatWidget />)

      await user.type(
        screen.getByPlaceholderText('Escribe un mensaje...'),
        'Abre Interstellar en IMDb',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      expect(
        await screen.findByText('Encontré Interstellar en IMDb.'),
      ).toBeInTheDocument()

      expect(openMock).toHaveBeenCalledWith(
        'about:blank',
        '_blank',
      )

      expect(replaceMock).toHaveBeenCalledWith(
        'https://www.imdb.com/title/tt0816692/',
      )

      expect(closeMock).not.toHaveBeenCalled()
    })

    it('opens a valid Google Books reference', async () => {
      const user = userEvent.setup()
      const replaceMock = vi.fn()

      vi.spyOn(window, 'open').mockReturnValue({
        closed: false,
        opener: null,
        location: {
          replace: replaceMock,
        },
        close: vi.fn(),
      } as unknown as Window)

      sendMessageMock.mockResolvedValue({
        message: 'Encontré El Hobbit en Google Books.',
        navigation: {
          type: 'open_reference',
          provider: 'google_books',
          url: 'https://books.google.com/books?id=book123',
        },
      })

      render(<ChatWidget />)

      await user.type(
        screen.getByPlaceholderText('Escribe un mensaje...'),
        'Abre El Hobbit en Google Books',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      expect(
        await screen.findByText(
          'Encontré El Hobbit en Google Books.',
        ),
      ).toBeInTheDocument()

      expect(replaceMock).toHaveBeenCalledWith(
        'https://books.google.com/books?id=book123',
      )
    })

    it('rejects unauthorized navigation URLs', async () => {
      const user = userEvent.setup()
      const replaceMock = vi.fn()
      const closeMock = vi.fn()

      vi.spyOn(window, 'open').mockReturnValue({
        closed: false,
        opener: null,
        location: {
          replace: replaceMock,
        },
        close: closeMock,
      } as unknown as Window)

      sendMessageMock.mockResolvedValue({
        message: 'Referencia recibida.',
        navigation: {
          type: 'open_reference',
          provider: 'imdb',
          url: 'https://example.com/malicious',
        },
      })

      render(<ChatWidget />)

      await user.type(
        screen.getByPlaceholderText('Escribe un mensaje...'),
        'Abre Interstellar en IMDb',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      expect(
        await screen.findByText('Referencia recibida.'),
      ).toBeInTheDocument()

      expect(replaceMock).not.toHaveBeenCalled()
      expect(closeMock).toHaveBeenCalled()
    })

    it('shows a fallback when the browser blocks a popup', async () => {
      const user = userEvent.setup()

      vi.spyOn(window, 'open').mockReturnValue(null)

      sendMessageMock.mockResolvedValue({
        message: 'Encontré la referencia.',
        navigation: {
          type: 'open_reference',
          provider: 'imdb',
          url: 'https://www.imdb.com/title/tt0816692/',
        },
      })

      render(<ChatWidget />)

      await user.type(
        screen.getByPlaceholderText('Escribe un mensaje...'),
        'Abre Interstellar en IMDb',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        }),
      )

      const fallback = await screen.findByRole('link', {
        name: 'Abrir referencia',
      })

      expect(fallback).toHaveAttribute(
        'href',
        'https://www.imdb.com/title/tt0816692/',
      )

      expect(fallback).toHaveAttribute(
        'target',
        '_blank',
      )
    })

    it('sends a welcome suggestion and displays the conversation', async () => {
      const user = userEvent.setup()

      sendMessageMock.mockResolvedValue({
        message: 'Te recomiendo Interstellar.',
      })

      render(<ChatWidget />)

      // La bienvenida aparece inicialmente.
      expect(
        screen.getByRole('heading', {
          name: '¿Qué historia exploramos hoy?',
        }),
      ).toBeInTheDocument()

      // Seleccionar una recomendación.
      await user.click(
        screen.getByRole('button', {
          name: /recomendaciones/i,
        }),
      )

      const expectedPrompt =
        'Recomiéndame 5 películas de ciencia ficción bien calificadas usando TMDB.'

      // El mensaje llega al servicio.
      expect(sendMessageMock).toHaveBeenCalledWith(
        expectedPrompt,
      )

      // La bienvenida desaparece.
      expect(
        screen.queryByRole('heading', {
          name: '¿Qué historia exploramos hoy?',
        }),
      ).not.toBeInTheDocument()

      // Se muestra el mensaje enviado.
      expect(
        screen.getByText(expectedPrompt),
      ).toBeInTheDocument()

      // Se muestra la respuesta del asistente.
      expect(
        await screen.findByText(
          'Te recomiendo Interstellar.',
        ),
      ).toBeInTheDocument()
    })

  })
