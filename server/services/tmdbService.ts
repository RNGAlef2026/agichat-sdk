
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


interface TMDBExternalIds {
  imdb_id?: string | null
}

export async function getMovieImdbUrl(
  movieId: number,
): Promise<string | null> {
  if (!Number.isSafeInteger(movieId) || movieId <= 0) {
    throw new Error('ID de película inválido')
  }

  const token = process.env.TMDB_ACCESS_TOKEN

  if (!token) {
    throw new Error('TMDB_ACCESS_TOKEN no está configurado')
  }

  const url = `${TMDB_BASE_URL}/movie/${movieId}/external_ids`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(
      `TMDB respondió con HTTP ${response.status}`,
    )
  }

  const data = (await response.json()) as TMDBExternalIds

  const imdbId = data.imdb_id

  if (
    typeof imdbId !== 'string' ||
    !/^tt\d{7,10}$/.test(imdbId)
  ) {
    return null
  }

  return `https://www.imdb.com/title/${imdbId}/`
}


const MOVIE_GENRES = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  drama: 18,
  fantasy: 14,
  horror: 27,
  romance: 10749,
  science_fiction: 878,
  thriller: 53,
} as const

export type MovieGenre = keyof typeof MOVIE_GENRES

export async function discoverMovies(
  genre: MovieGenre,
): Promise<Movie[]> {
  const token = process.env.TMDB_ACCESS_TOKEN

  if (!token) {
    throw new Error('TMDB_ACCESS_TOKEN no está configurado')
  }

  const genreId = MOVIE_GENRES[genre]

  if (!genreId) {
    throw new Error('Género de película inválido')
  }

  const url = new URL(`${TMDB_BASE_URL}/discover/movie`)

  url.searchParams.set('with_genres', String(genreId))
  url.searchParams.set('language', 'es-ES')
  url.searchParams.set('sort_by', 'vote_average.desc')
  url.searchParams.set('vote_count.gte', '200')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('page', '1')

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(
      `TMDB respondió con HTTP ${response.status}`,
    )
  }

  const data =
    (await response.json()) as TMDBSearchResponse

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
