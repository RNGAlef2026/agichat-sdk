
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchMovies } from '../services/tmdbService'

export function createMovieMcpServer() {
  const server = new McpServer({
    name: 'agichat-movie-server',
    version: '1.0.0',
  })

  server.registerTool(
    'search_movies',
    {
      description:
        'Busca películas reales en The Movie Database (TMDB) por título. ' +
        'Devuelve títulos, sinopsis, fechas, calificaciones y URLs de pósteres.',

      inputSchema: {
        query: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('Título de la película que se desea buscar'),
      },
    },
    async ({ query }) => {
      try {
        const movies = await searchMovies(query)

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                source: 'TMDB',
                movies,
              }),
            },
          ],
        }
      } catch {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'No fue posible consultar TMDB.',
            },
          ],
        }
      }
    },
  )

  return server
}
