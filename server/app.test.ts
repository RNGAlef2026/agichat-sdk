
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import { once } from 'node:events'
import { app } from './app'
import { generateMovieResponse } from './agents/movieAgent'

vi.mock('./agents/movieAgent', () => ({
  generateMovieResponse: vi.fn(),
}))

const generateResponseMock = vi.mocked(generateMovieResponse)

let server: Server
let baseUrl: string

async function postChat(body: unknown) {
  return fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('AGIChat Backend API', () => {
  beforeAll(async () => {
    server = app.listen(0)

    await once(server, 'listening')

    const address = server.address()

    if (!address || typeof address === 'string') {
      throw new Error('No fue posible obtener el puerto del servidor')
    }

    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        })
      })
    }
  })

  beforeEach(() => {
    generateResponseMock.mockReset()
  })

  it('returns the backend health status', async () => {
    const response = await fetch(`${baseUrl}/api/health`)

    expect(response.status).toBe(200)

    expect(await response.json()).toEqual({
      status: 'ok',
      service: 'AGIChat Backend',
    })
  })

  it('returns an AI response for a valid message', async () => {
    generateResponseMock.mockResolvedValue(
      'Interstellar tiene una calificación de 8.49.',
    )

    const response = await postChat({
      message: 'Busca Interstellar',
    })

    expect(response.status).toBe(200)

    expect(await response.json()).toEqual({
      message: 'Interstellar tiene una calificación de 8.49.',
    })

    expect(generateResponseMock).toHaveBeenCalledWith(
      'Busca Interstellar',
    )
  })

  it('rejects requests without a message', async () => {
    const response = await postChat({})

    expect(response.status).toBe(400)
    expect(generateResponseMock).not.toHaveBeenCalled()
  })

  it('rejects empty messages', async () => {
    const response = await postChat({
      message: '   ',
    })

    expect(response.status).toBe(400)
    expect(generateResponseMock).not.toHaveBeenCalled()
  })

  it('rejects messages that are not strings', async () => {
    const response = await postChat({
      message: 123,
    })

    expect(response.status).toBe(400)
    expect(generateResponseMock).not.toHaveBeenCalled()
  })

  it('rejects messages longer than 2000 characters', async () => {
    const response = await postChat({
      message: 'A'.repeat(2001),
    })

    expect(response.status).toBe(400)
    expect(generateResponseMock).not.toHaveBeenCalled()
  })

  it('rejects a null request body', async () => {
    const response = await postChat(null)

    expect(response.status).toBe(400)
    expect(generateResponseMock).not.toHaveBeenCalled()
  })

  it('returns HTTP 502 when the agent fails', async () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    try {
      generateResponseMock.mockRejectedValue(
        new Error('Gemini unavailable'),
      )

      const response = await postChat({
        message: 'Hola Sofía',
      })

      expect(response.status).toBe(502)

      expect(await response.json()).toEqual({
        error: 'No fue posible generar una respuesta.',
      })
    } finally {
      consoleSpy.mockRestore()
    }
  })
})
