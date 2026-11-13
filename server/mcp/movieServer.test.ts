
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createMovieMcpServer } from './movieServer'
import { searchMovies } from '../services/tmdbService'
import { searchBooks } from '../services/googleBooksService'

vi.mock('../services/tmdbService', () => ({
  searchMovies: vi.fn(),
}))

vi.mock('../services/googleBooksService', () => ({
  searchBooks: vi.fn(),
}))

const searchMoviesMock = vi.mocked(searchMovies)
const searchBooksMock = vi.mocked(searchBooks)

const clients: Client[] = []
const servers: ReturnType<typeof createMovieMcpServer>[] = []

async function createConnection() {
  const server = createMovieMcpServer()

  const client = new Client({
    name: 'agichat-test-client',
    version: '1.0.0',
  })

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair()

  await server.connect(serverTransport)
  await client.connect(clientTransport)

  clients.push(client)
  servers.push(server)

  return client
}

describe('movie MCP server', () => {
  afterEach(async () => {
    searchMoviesMock.mockReset()
    searchBooksMock.mockReset()

    await Promise.all(
      clients.splice(0).map((client) => client.close()),
    )

    await Promise.all(
      servers.splice(0).map((server) => server.close()),
    )
  })

  it('exposes both tools', async () => {
    const client = await createConnection()

    const { tools } = await client.listTools()
    const names = tools.map((tool) => tool.name)

    expect(names).toContain('search_movies')
    expect(names).toContain('search_books')
  })

  it('executes search_movies using TMDB', async () => {
    searchMoviesMock.mockResolvedValue([
      {
        id: 157336,
        title: 'Interstellar',
        overview: 'Una aventura espacial.',
        releaseDate: '2014-11-04',
        rating: 8.493,
        posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      },
    ])

    const client = await createConnection()

    const result = await client.callTool({
      name: 'search_movies',
      arguments: {
        query: 'Interstellar',
      },
    })

    expect(result.isError).not.toBe(true)
    expect(searchMoviesMock).toHaveBeenCalledWith('Interstellar')

    const serialized = JSON.stringify(result.content)

    expect(serialized).toContain('TMDB')
    expect(serialized).toContain('Interstellar')
    expect(serialized).toContain('8.493')
  })

  it('executes search_books using Google Books', async () => {
    searchBooksMock.mockResolvedValue([
      {
        id: 'book-123',
        title: "Harry Potter and the Philosopher's Stone",
        authors: ['J. K. Rowling'],
        description: 'Un joven mago descubre su destino.',
        publishedDate: '1997-06-26',
        pageCount: 223,
        infoLink: 'https://books.google.com/books?id=book-123',
      },
    ])

    const client = await createConnection()

    const result = await client.callTool({
      name: 'search_books',
      arguments: {
        query: 'Harry Potter',
      },
    })

    expect(result.isError).not.toBe(true)
    expect(searchBooksMock).toHaveBeenCalledWith('Harry Potter')

    const serialized = JSON.stringify(result.content)

    expect(serialized).toContain('Google Books')
    expect(serialized).toContain('Harry Potter')
    expect(serialized).toContain('J. K. Rowling')
  })

  it('handles TMDB failures', async () => {
    searchMoviesMock.mockRejectedValue(
      new Error('TMDB unavailable'),
    )

    const client = await createConnection()

    const result = await client.callTool({
      name: 'search_movies',
      arguments: {
        query: 'Interstellar',
      },
    })

    expect(result.isError).toBe(true)
    expect(JSON.stringify(result.content)).toContain(
      'No fue posible consultar TMDB.',
    )
  })

  it('handles Google Books failures', async () => {
    searchBooksMock.mockRejectedValue(
      new Error('Google Books unavailable'),
    )

    const client = await createConnection()

    const result = await client.callTool({
      name: 'search_books',
      arguments: {
        query: 'Harry Potter',
      },
    })

    expect(result.isError).toBe(true)
    expect(JSON.stringify(result.content)).toContain(
      'No fue posible consultar Google Books.',
    )
  })

  it('rejects invalid movie searches', async () => {
    const client = await createConnection()

    const result = await client.callTool({
      name: 'search_movies',
      arguments: {
        query: '',
      },
    })

    expect(result.isError).toBe(true)
    expect(searchMoviesMock).not.toHaveBeenCalled()
  })

  it('rejects invalid book searches', async () => {
    const client = await createConnection()

    const result = await client.callTool({
      name: 'search_books',
      arguments: {
        query: '',
      },
    })

    expect(result.isError).toBe(true)
    expect(searchBooksMock).not.toHaveBeenCalled()
  })
})
