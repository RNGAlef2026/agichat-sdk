
export interface InputValidation {
  allowed: boolean
  reason?: string
}

export function validateUserInput(
  message: string,
): InputValidation {
  if (
    typeof message !== 'string' ||
    !message.trim() ||
    message.length > 2000
  ) {
    return {
      allowed: false,
      reason: 'Mensaje inválido',
    }
  }

  return {
    allowed: true,
  }
}
