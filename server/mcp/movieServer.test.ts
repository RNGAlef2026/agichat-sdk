
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createMovieMcpServer } from './movieServer'
import { searchMovies } from '../services/tmdbService'

vi.mock('../services/tmdbService', () => ({
  searchMovies: vi.fn(),
}))

const searchMoviesMock = vi.mocked(searchMovies)

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

    await Promise.all(clients.splice(0).map((client) => client.close()))
    await Promise.all(servers.splice(0).map((server) => server.close()))
  })

  it('exposes the search_movies tool', async () => {
    const client = await createConnection()

    const { tools } = await client.listTools()

    expect(tools.map((tool) => tool.name)).toContain('search_movies')
  })

  it('executes search_movies using the TMDB service', async () => {
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

  it('returns an MCP error when TMDB fails', async () => {
    searchMoviesMock.mockRejectedValue(new Error('TMDB unavailable'))

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

  it('rejects invalid tool arguments', async () => {
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
})
