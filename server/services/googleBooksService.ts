
const GOOGLE_BOOKS_URL =
  'https://www.googleapis.com/books/v1/volumes'

export interface Book {
  id: string
  title: string
  authors: string[]
  description: string
  publishedDate: string
  pageCount: number | null
  infoLink: string | null
}

interface GoogleBookVolume {
  id: string
  volumeInfo?: {
    title?: string
    authors?: string[]
    description?: string
    publishedDate?: string
    pageCount?: number
    infoLink?: string
  }
}

interface GoogleBooksResponse {
  items?: GoogleBookVolume[]
}

export async function searchBooks(
  query: string,
): Promise<Book[]> {
  const search = query.trim()

  if (!search || search.length > 200) {
    throw new Error(
      'La búsqueda debe tener entre 1 y 200 caracteres',
    )
  }

  const url = new URL(GOOGLE_BOOKS_URL)

  url.searchParams.set('q', search)
  url.searchParams.set('maxResults', '5')
  url.searchParams.set('printType', 'books')

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_BOOKS_API_KEY no esta configurada')
  }

  url.searchParams.set('key', apiKey)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(
      `Google Books respondió con HTTP ${response.status}`,
    )
  }

  const data =
    (await response.json()) as GoogleBooksResponse

  return (data.items ?? []).map((book) => {
    const info = book.volumeInfo

    return {
      id: book.id,
      title: info?.title ?? 'Título desconocido',
      authors: info?.authors ?? [],
      description: info?.description ?? '',
      publishedDate: info?.publishedDate ?? '',
      pageCount: info?.pageCount ?? null,
      infoLink: info?.infoLink ?? null,
    }
  })
}
