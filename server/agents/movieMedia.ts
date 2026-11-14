
export interface MovieMedia {
  posterUrl: string
  movieTitle: string
}

export function extractMovieMedia(
  toolText: string,
  query: string,
): MovieMedia | null {
  try {
    const data: unknown = JSON.parse(toolText)

    if (
      typeof data !== 'object' ||
      data === null ||
      !('source' in data) ||
      data.source !== 'TMDB' ||
      !('movies' in data) ||
      !Array.isArray(data.movies)
    ) {
      return null
    }

    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

    const movie = data.movies.find(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'title' in item &&
        typeof item.title === 'string' &&
        normalize(item.title) === normalize(query),
    )

    if (
      !movie ||
      typeof movie.posterUrl !== 'string' ||
      typeof movie.title !== 'string'
    ) {
      return null
    }

    const url = new URL(movie.posterUrl)

    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'image.tmdb.org' ||
      !/^\/t\/p\/[a-zA-Z0-9]+\/[a-zA-Z0-9._-]+$/.test(url.pathname)
    ) {
      return null
    }

    return {
      posterUrl: url.toString(),
      movieTitle: movie.title,
    }
  } catch {
    return null
  }
}
