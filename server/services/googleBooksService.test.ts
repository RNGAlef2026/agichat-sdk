import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it, 
  vi,
} from 'vitest'

import { searchBooks } from './googleBooksService'

describe('googleBooksService', () => {

  beforeEach(() => {
    vi.stubEnv('GOOGLE_BOOKS_API_KEY', 'test-google-books-key')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('searches books using Google Books API', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'book-123',
              volumeInfo: {
                title: "Harry Potter and the Philosopher's Stone",
                authors: ['J. K. Rowling'],
                description: 'A young wizard discovers his destiny.',
                publishedDate: '1997-06-26',
                pageCount: 223,
                infoLink: 'https://books.google.com/books?id=book-123',
              },
            },
          ],
        }),
        { status: 200 },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    const books = await searchBooks('Harry Potter')

    expect(books).toHaveLength(1)

    expect(books[0]).toEqual({
      id: 'book-123',
      title: "Harry Potter and the Philosopher's Stone",
      authors: ['J. K. Rowling'],
      description: 'A young wizard discovers his destiny.',
      publishedDate: '1997-06-26',
      pageCount: 223,
      infoLink: 'https://books.google.com/books?id=book-123',
    })

    const [url, options] = fetchMock.mock.calls[0]

    expect(String(url)).toContain('www.googleapis.com/books/v1/volumes')
    expect(String(url)).toContain('q=Harry+Potter')
    expect(String(url)).toContain('maxResults=5')
    expect(options?.headers).toEqual({
      Accept: 'application/json',
    })
  })

  it('rejects empty searches', async () => {
    await expect(
      searchBooks('   '),
    ).rejects.toThrow(
      'La búsqueda debe tener entre 1 y 200 caracteres',
    )
  })

  it('rejects searches longer than 200 characters', async () => {
    await expect(
      searchBooks('A'.repeat(201)),
    ).rejects.toThrow(
      'La búsqueda debe tener entre 1 y 200 caracteres',
    )
  })

  it('handles Google Books HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, { status: 429 }),
      ),
    )

    await expect(
      searchBooks('Harry Potter'),
    ).rejects.toThrow(
      'Google Books respondió con HTTP 429',
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
      searchBooks('Harry Potter'),
    ).rejects.toThrow('Network failure')
  })

  it('returns an empty array when no books are found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 }),
      ),
    )

    const books = await searchBooks('Unknown Book')

    expect(books).toEqual([])
  })

  it('handles books with missing metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            items: [{ id: 'incomplete-book' }],
          }),
          { status: 200 },
        ),
      ),
    )

    const books = await searchBooks('Incomplete Book')

    expect(books[0]).toEqual({
      id: 'incomplete-book',
      title: 'Título desconocido',
      authors: [],
      description: '',
      publishedDate: '',
      pageCount: null,
      infoLink: null,
    })
  })

  it('sends the Google Books API key', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    await searchBooks('Harry Potter')

    const [url] = fetchMock.mock.calls[0]
    const requestUrl = new URL(String(url))

    expect(requestUrl.searchParams.get('key')).toBe(
      'test-google-books-key',
    )
  })

  it('rejects requests without an API key', async () => {
    vi.stubEnv('GOOGLE_BOOKS_API_KEY', '')

    await expect(
      searchBooks('Harry Potter'),
    ).rejects.toThrow(
      'GOOGLE_BOOKS_API_KEY no esta configurada',
    )
  })

})
