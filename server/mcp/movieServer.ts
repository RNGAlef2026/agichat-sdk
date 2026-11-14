
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  getMovieImdbUrl,
  searchMovies,
} from '../services/tmdbService'
import {
  searchBooks,
  getGoogleBooksUrl
} from '../services/googleBooksService'

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

        const booksWithReferences = books.map((book) => ({
          ...book,
          referenceUrl: getGoogleBooksUrl(book.id),
        }))

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                source: 'Google Books',
                books: booksWithReferences,
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

  server.registerTool(
    'get_imdb_reference',
    {
      description:
        'Obtiene la URL oficial de IMDb de una película ' +
        'utilizando su identificador de TMDB.',
      inputSchema: {
        movieId: z.number().int().positive(),
      },
    },
    async ({ movieId }) => {
      try {
        const url = await getMovieImdbUrl(movieId)

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                source: 'TMDB',
                provider: 'imdb',
                url,
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
              text: 'No fue posible obtener la referencia de IMDb.',
            },
          ],
        }
      }
    },
  )

  return server
}
