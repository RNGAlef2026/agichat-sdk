
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { discoverMovies } from './tmdbService'

describe('discoverMovies', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_ACCESS_TOKEN', 'test-token')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('discovers science fiction movies using TMDB', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 157336,
              title: 'Interstellar',
              overview: 'Película de ciencia ficción.',
              release_date: '2014-11-05',
              vote_average: 8.5,
              poster_path: '/interstellar.jpg',
            },
          ],
        }),
        { status: 200 },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    const movies = await discoverMovies('science_fiction')

    expect(movies).toHaveLength(1)

    expect(movies[0]).toEqual({
      id: 157336,
      title: 'Interstellar',
      overview: 'Película de ciencia ficción.',
      releaseDate: '2014-11-05',
      rating: 8.5,
      posterUrl:
        'https://image.tmdb.org/t/p/w500/interstellar.jpg',
    })

    const [requestUrl] = fetchMock.mock.calls[0]
    const url = new URL(String(requestUrl))

    expect(url.pathname).toBe('/3/discover/movie')
    expect(url.searchParams.get('with_genres')).toBe('878')
    expect(url.searchParams.get('sort_by')).toBe(
      'vote_average.desc',
    )
    expect(url.searchParams.get('vote_count.gte')).toBe('200')
    expect(url.searchParams.get('include_adult')).toBe('false')
  })

  it('rejects unsupported movie genres', async () => {
    await expect(
      discoverMovies('invalid_genre' as never),
    ).rejects.toThrow('Género de película inválido')
  })

  it('rejects requests without a TMDB token', async () => {
    vi.stubEnv('TMDB_ACCESS_TOKEN', '')

    await expect(
      discoverMovies('action'),
    ).rejects.toThrow(
      'TMDB_ACCESS_TOKEN no está configurado',
    )
  })

  it('handles TMDB HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, { status: 429 }),
      ),
    )

    await expect(
      discoverMovies('horror'),
    ).rejects.toThrow('TMDB respondió con HTTP 429')
  })

  it('returns an empty array when no movies are found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ results: [] }),
          { status: 200 },
        ),
      ),
    )

    const movies = await discoverMovies('comedy')

    expect(movies).toEqual([])
  })
})
