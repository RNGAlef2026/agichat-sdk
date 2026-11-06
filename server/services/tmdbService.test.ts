
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { searchMovies } from './tmdbService'

describe('tmdbService', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_ACCESS_TOKEN', 'test-token')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('searches movies using TMDB', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 157336,
              title: 'Interstellar',
              overview: 'Una aventura espacial.',
              release_date: '2014-11-04',
              vote_average: 8.493,
              poster_path: '/poster.jpg',
            },
          ],
        }),
        { status: 200 },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    const movies = await searchMovies('Interstellar')

    expect(movies).toHaveLength(1)

    expect(movies[0]).toEqual({
      id: 157336,
      title: 'Interstellar',
      overview: 'Una aventura espacial.',
      releaseDate: '2014-11-04',
      rating: 8.493,
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    })

    expect(fetchMock).toHaveBeenCalledOnce()

    const [url, options] = fetchMock.mock.calls[0]

    expect(String(url)).toContain('/search/movie')
    expect(String(url)).toContain('query=Interstellar')

    expect(options?.headers).toEqual({
      Authorization: 'Bearer test-token',
      Accept: 'application/json',
    })
  })

  it('rejects empty searches', async () => {
    await expect(
      searchMovies('   '),
    ).rejects.toThrow(
      'La búsqueda debe tener entre 1 y 200 caracteres',
    )
  })

  it('rejects searches longer than 200 characters', async () => {
    await expect(
      searchMovies('A'.repeat(201)),
    ).rejects.toThrow(
      'La búsqueda debe tener entre 1 y 200 caracteres',
    )
  })

  it('rejects requests without an API token', async () => {
    vi.stubEnv('TMDB_ACCESS_TOKEN', '')

    await expect(
      searchMovies('Interstellar'),
    ).rejects.toThrow(
      'TMDB_ACCESS_TOKEN no está configurado',
    )
  })

  it('handles TMDB HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, { status: 401 }),
      ),
    )

    await expect(
      searchMovies('Interstellar'),
    ).rejects.toThrow(
      'TMDB respondió con HTTP 401',
    )
  })

  it('handles network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(
        new Error('Network failure'),
      ),
    )

    await expect(
      searchMovies('Interstellar'),
    ).rejects.toThrow('Network failure')
  })
})
