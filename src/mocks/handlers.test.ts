import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { handlers } from './handlers'

const server = setupServer(...handlers)

describe('chat mock API', () => {
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    })
  })

  afterAll(() => {
    server.close()
  })

  it('returns the universe response when the message mentions universo', async () => {
    const response = await fetch('http://localhost/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '¿Cuál es la respuesta del universo?',
      }),
    })

    expect(response.ok).toBe(true)

    const body = (await response.json()) as {
      message: string
    }

    expect(body.message).toContain('La respuesta es 42')
    expect(body.message).toContain('**42**')
  })

  it('returns a generic Markdown response for other messages', async () => {
    const response = await fetch('http://localhost/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hola Sofía',
      }),
    })

    expect(response.ok).toBe(true)

    const body = (await response.json()) as {
      message: string
    }

    expect(body.message).toContain('## Sofía')
    expect(body.message).toContain('**Hola Sofía**')
    expect(body.message).toContain('API simulada de AGIChat')
  })
})