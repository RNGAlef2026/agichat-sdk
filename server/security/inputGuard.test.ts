
import { describe, expect, it } from 'vitest'
import { validateUserInput } from './inputGuard'

describe('inputGuard', () => {
  it('accepts valid user messages', () => {
    expect(
      validateUserInput('Recomiéndame una película'),
    ).toEqual({
      allowed: true,
    })
  })

  it('rejects empty messages', () => {
    expect(
      validateUserInput('   '),
    ).toEqual({
      allowed: false,
      reason: 'Mensaje inválido',
    })
  })

  it('rejects oversized messages', () => {
    expect(
      validateUserInput('A'.repeat(2001)),
    ).toEqual({
      allowed: false,
      reason: 'Mensaje inválido',
    })
  })

  it('rejects non-string values', () => {
    expect(
      validateUserInput(null as unknown as string),
    ).toEqual({
      allowed: false,
      reason: 'Mensaje inválido',
    })
  })
})
