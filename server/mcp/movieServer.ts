
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchMovies } from '../services/tmdbService'
import { searchBooks } from '../services/googleBooksService'

export function createMovieMcpServer() {
  const server = new McpServer({
    name: 'agichat-movie-server',
    version: '1.0.0',
  })

  server.registerTool(
    'search_movies',
    {
      description:
        'Busca películas reales en TMDB por título. ' +
        'Devuelve títulos, sinopsis, fechas, calificaciones y pósteres.',
      inputSchema: {
        query: z.string().trim().min(1).max(200),
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

  server.registerTool(
    'search_books',
    {
      description:
        'Busca libros reales mediante Google Books API. ' +
        'Devuelve títulos, autores, descripciones, fechas y enlaces.',
      inputSchema: {
        query: z.string().trim().min(1).max(200),
      },
    },
    async ({ query }) => {
      try {
        const books = await searchBooks(query)

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                source: 'Google Books',
                books,
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
              text: 'No fue posible consultar Google Books.',
            },
          ],
        }
      }
    },
  )

  return server
}
