
export interface OutputValidation {
  allowed: boolean
  reason?: string
}

const SENSITIVE_PATTERNS = [
  /GEMINI_API_KEY\s*=/i,
  /GOOGLE_BOOKS_API_KEY\s*=/i,
  /TMDB_ACCESS_TOKEN\s*=/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
]

export function validateAgentOutput(
  response: string,
): OutputValidation {
  if (typeof response !== 'string') {
    return {
      allowed: false,
      reason: 'Respuesta inválida',
    }
  }

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(response)) {
      return {
        allowed: false,
        reason: 'Posible filtración de información sensible',
      }
    }
  }

  return {
    allowed: true,
  }
}
