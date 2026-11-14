
import { describe, expect, it } from 'vitest'
import { extractMovieMedia } from './movieMedia'

const validPoster =
  'https://image.tmdb.org/t/p/w500/interstellar.jpg'

function createResult(
  movies: unknown[],
  source = 'TMDB',
): string {
  return JSON.stringify({
    source,
    movies,
  })
}

describe('movieMedia', () => {
  it('extracts a valid TMDB poster', () => {
    const result = createResult([
      {
        title: 'Interstellar',
        posterUrl: validPoster,
      },
    ])

    expect(
      extractMovieMedia(result, 'Interstellar'),
    ).toEqual({
      posterUrl: validPoster,
      movieTitle: 'Interstellar',
    })
  })

  it('matches titles without case or accent differences', () => {
    const result = createResult([
      {
        title: 'El Señor de los Anillos',
        posterUrl: validPoster,
      },
    ])

    expect(
      extractMovieMedia(result, 'el senor de los anillos'),
    ).toEqual({
      posterUrl: validPoster,
      movieTitle: 'El Señor de los Anillos',
    })
  })

  it('rejects results from other sources', () => {
    const result = createResult([
      {
        title: 'Interstellar',
        posterUrl: validPoster,
      },
    ], 'Google Books')

    expect(
      extractMovieMedia(result, 'Interstellar'),
    ).toBeNull()
  })

  it('rejects movies with different titles', () => {
    const result = createResult([
      {
        title: 'Interstellar Wars',
        posterUrl: validPoster,
      },
    ])

    expect(
      extractMovieMedia(result, 'Interstellar'),
    ).toBeNull()
  })

  it('rejects external poster domains', () => {
    const result = createResult([
      {
        title: 'Interstellar',
        posterUrl: 'https://example.com/poster.jpg',
      },
    ])

    expect(
      extractMovieMedia(result, 'Interstellar'),
    ).toBeNull()
  })

  it('rejects unsafe URL protocols', () => {
    const result = createResult([
      {
        title: 'Interstellar',
        posterUrl: 'javascript:alert(1)',
      },
    ])

    expect(
      extractMovieMedia(result, 'Interstellar'),
    ).toBeNull()
  })

  it('rejects invalid JSON', () => {
    expect(
      extractMovieMedia('invalid json', 'Interstellar'),
    ).toBeNull()
  })

  it('rejects movies without posters', () => {
    const result = createResult([
      {
        title: 'Interstellar',
        posterUrl: null,
      },
    ])

    expect(
      extractMovieMedia(result, 'Interstellar'),
    ).toBeNull()
  })
})
