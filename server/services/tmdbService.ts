
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500'

export interface Movie {
  id: number
  title: string
  overview: string
  releaseDate: string
  rating: number
  posterUrl: string | null
}

interface TMDBMovie {
  id: number
  title: string
  overview: string
  release_date?: string
  vote_average: number
  poster_path: string | null
}

interface TMDBSearchResponse {
  results: TMDBMovie[]
}

export async function searchMovies(
  query: string,
): Promise<Movie[]> {
  const token = process.env.TMDB_ACCESS_TOKEN

  if (!token) {
    throw new Error('TMDB_ACCESS_TOKEN no está configurado')
  }

  const search = query.trim()

  if (!search || search.length > 200) {
    throw new Error('La búsqueda debe tener entre 1 y 200 caracteres')
  }

  const url = new URL(`${TMDB_BASE_URL}/search/movie`)

  url.searchParams.set('query', search)
  url.searchParams.set('language', 'es-ES')
  url.searchParams.set('include_adult', 'false')

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`TMDB respondió con HTTP ${response.status}`)
  }

  const data = (await response.json()) as TMDBSearchResponse

  return data.results.slice(0, 5).map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.release_date ?? '',
    rating: movie.vote_average,
    posterUrl:
      movie.poster_path?.startsWith('/')
        ? `${TMDB_IMAGE_URL}${movie.poster_path}`
        : null,
  }))
}
