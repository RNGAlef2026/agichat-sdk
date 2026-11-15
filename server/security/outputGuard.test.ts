
import { describe, expect, it } from 'vitest'
import { validateAgentOutput } from './outputGuard'

describe('outputGuard', () => {
  it('accepts normal assistant responses', () => {
    expect(
      validateAgentOutput(
        'Interstellar es una película de ciencia ficción.',
      ),
    ).toEqual({
      allowed: true,
    })
  })

  it('detects Gemini API key assignments', () => {
    expect(
      validateAgentOutput('GEMINI_API_KEY=example-secret'),
    ).toEqual({
      allowed: false,
      reason: 'Posible filtración de información sensible',
    })
  })

  it('detects TMDB credentials', () => {
    expect(
      validateAgentOutput('TMDB_ACCESS_TOKEN=example-secret'),
    ).toMatchObject({
      allowed: false,
    })
  })

  it('detects Google Books credentials', () => {
    expect(
      validateAgentOutput(
        'GOOGLE_BOOKS_API_KEY=example-secret',
      ),
    ).toMatchObject({
      allowed: false,
    })
  })

  it('detects private key headers', () => {
    expect(
      validateAgentOutput(
        '-----BEGIN PRIVATE KEY-----',
      ),
    ).toMatchObject({
      allowed: false,
    })
  })

  it('rejects non-string responses', () => {
    expect(
      validateAgentOutput(null as unknown as string),
    ).toEqual({
      allowed: false,
      reason: 'Respuesta inválida',
    })
  })
})
