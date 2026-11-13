
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const mocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
  listTools: vi.fn(),
  callTool: vi.fn(),
  clientConnect: vi.fn(),
  clientClose: vi.fn(),
  serverConnect: vi.fn(),
  serverClose: vi.fn(),
}))

vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@google/genai')>()

  return {
    ...actual,
    GoogleGenAI: class {
      models = {
        generateContent: mocks.generateContent,
      }
    },
  }
})

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: class {
    listTools = mocks.listTools
    callTool = mocks.callTool
    connect = mocks.clientConnect
    close = mocks.clientClose
  },
}))

vi.mock('@modelcontextprotocol/sdk/inMemory.js', () => ({
  InMemoryTransport: {
    createLinkedPair: () => [{}, {}],
  },
}))

vi.mock('../mcp/movieServer', () => ({
  createMovieMcpServer: () => ({
    connect: mocks.serverConnect,
    close: mocks.serverClose,
  }),
}))

import { generateMovieResponse } from './movieAgent'

describe('movieAgent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')

    mocks.listTools.mockResolvedValue({
      tools: [{ name: 'search_movies' }],
    })

    mocks.clientConnect.mockResolvedValue(undefined)
    mocks.serverConnect.mockResolvedValue(undefined)
    mocks.clientClose.mockResolvedValue(undefined)
    mocks.serverClose.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('generates a response without tools when unnecessary', async () => {
    mocks.generateContent.mockResolvedValue({
      text: '¡Hola! Soy Sofía.',
      functionCalls: [],
    })

    const response = await generateMovieResponse('Hola')

    expect(response).toBe('¡Hola! Soy Sofía.')
    expect(mocks.generateContent).toHaveBeenCalledOnce()
    expect(mocks.callTool).not.toHaveBeenCalled()
  })

  it('uses MCP when Gemini requests a movie search', async () => {
    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: 'search_movies',
            args: { query: 'Interstellar' },
          },
        ],
        candidates: [
          {
            content: {
              role: 'model',
              parts: [
                {
                  functionCall: {
                    name: 'search_movies',
                    args: { query: 'Interstellar' },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text: 'Interstellar tiene una calificación de 8.49.',
      })

    mocks.callTool.mockResolvedValue({
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            source: 'TMDB',
            movies: [
              {
                title: 'Interstellar',
                rating: 8.493,
              },
            ],
          }),
        },
      ],
    })

    const response = await generateMovieResponse(
      'Busca Interstellar en TMDB',
    )

    expect(mocks.callTool).toHaveBeenCalledWith({
      name: 'search_movies',
      arguments: {
        query: 'Interstellar',
      },
    })

    expect(mocks.generateContent).toHaveBeenCalledTimes(2)
    expect(response).toContain('8.49')
  })

  it('rejects requests without a Gemini API key', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    await expect(
      generateMovieResponse('Hola'),
    ).rejects.toThrow('GEMINI_API_KEY no está configurada')
  })

  it('rejects requests when the MCP tool is unavailable', async () => {
    mocks.listTools.mockResolvedValue({
      tools: [],
    })

    await expect(
      generateMovieResponse('Busca Interstellar'),
    ).rejects.toThrow(
      'La herramienta search_movies no está disponible',
    )

    expect(mocks.clientClose).toHaveBeenCalled()
    expect(mocks.serverClose).toHaveBeenCalled()
  })
  it('handles MCP tool failures', async () => {
    mocks.generateContent.mockResolvedValue({
      functionCalls: [
        {
          name: 'search_movies',
          args: { query: 'Interstellar' },
        },
      ],
      candidates: [
        {
          content: {
            role: 'model',
            parts: [
              {
                functionCall: {
                  name: 'search_movies',
                  args: { query: 'Interstellar' },
                },
              },
            ],
          },
        },
      ],
    })

    mocks.callTool.mockResolvedValue({
      isError: true,
      content: [
        {
          type: 'text',
          text: 'TMDB unavailable',
        },
      ],
    })

    await expect(
      generateMovieResponse('Busca Interstellar'),
    ).rejects.toThrow('La herramienta search_movies falló')

    expect(mocks.clientClose).toHaveBeenCalled()
    expect(mocks.serverClose).toHaveBeenCalled()
  })


  it('uses TMDB and Google Books in the same conversation', async () => {
    mocks.listTools.mockResolvedValue({
      tools: [
        { name: 'search_movies' },
        { name: 'search_books' },
      ],
    })

    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: 'search_movies',
            args: { query: 'Harry Potter' },
          },
          {
            name: 'search_books',
            args: { query: 'Harry Potter and the Philosopher Stone' },
          },
        ],
        candidates: [
          {
            content: {
              role: 'model',
              parts: [
                {
                  functionCall: {
                    name: 'search_movies',
                    args: { query: 'Harry Potter' },
                  },
                },
                {
                  functionCall: {
                    name: 'search_books',
                    args: {
                      query: 'Harry Potter and the Philosopher Stone',
                    },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text: 'La película es una adaptación del libro y vale la pena verla.',
        functionCalls: [],
      })

    mocks.callTool.mockImplementation(async ({ name }) => {
      if (name === 'search_movies') {
        return {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                source: 'TMDB',
                movies: [
                  {
                    title: 'Harry Potter and the Philosopher Stone',
                    rating: 7.9,
                  },
                ],
              }),
            },
          ],
        }
      }

      if (name === 'search_books') {
        return {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                source: 'Google Books',
                books: [
                  {
                    title: 'Harry Potter and the Philosopher Stone',
                    authors: ['J. K. Rowling'],
                  },
                ],
              }),
            },
          ],
        }
      }

      throw new Error('Unexpected tool')
    })

    const response = await generateMovieResponse(
      'Compara Harry Potter con su libro original',
    )

    expect(mocks.callTool).toHaveBeenCalledTimes(2)

    expect(mocks.callTool).toHaveBeenCalledWith({
      name: 'search_movies',
      arguments: {
        query: 'Harry Potter',
      },
    })

    expect(mocks.callTool).toHaveBeenCalledWith({
      name: 'search_books',
      arguments: {
        query: 'Harry Potter and the Philosopher Stone',
      },
    })

    expect(mocks.generateContent).toHaveBeenCalledTimes(2)

    expect(response).toContain('vale la pena verla')

    expect(mocks.clientClose).toHaveBeenCalled()
    expect(mocks.serverClose).toHaveBeenCalled()
  })

})
