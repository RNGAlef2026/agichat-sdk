import { afterEach, describe, expect, it, vi } from 'vitest'
import { chatService } from './chatService'

describe('chatService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends the message to the chat endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Respuesta de Sofía',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )

    const response = await chatService.sendMessage('Hola')

    expect(fetchMock).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hola',
      }),
    })

    expect(response).toEqual({
      message: 'Respuesta de Sofía',
    })
  })

  it('throws an error when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    )

    await expect(
      chatService.sendMessage('Hola'),
    ).rejects.toThrow(
      'No fue posible obtener una respuesta del asistente.',
    )
  })
})