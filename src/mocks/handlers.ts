import { delay, http, HttpResponse } from 'msw'
import type {
  SendMessageRequest,
  SendMessageResponse,
} from '../types/chat'

export const handlers = [
  http.post('*/api/chat', async ({ request }) => {
    const body = (await request.json()) as SendMessageRequest

    await delay(600)

    const response: SendMessageResponse = {
      message: createMockResponse(body.message),
    }

    return HttpResponse.json(response)
  }),
]

function createMockResponse(message: string): string {
  const normalizedMessage = message.trim().toLowerCase()

  if (normalizedMessage.includes('universo')) {
    return [
      '## La respuesta es 42',
      '',
      'Según *La guía del autoestopista galáctico*, **42** es la respuesta a la pregunta definitiva sobre la vida, el universo y todo lo demás.',
    ].join('\n')
  }

  return [
    '## Sofía',
    '',
    `Recibí tu mensaje: **${message}**`,
    '',
    'Esta respuesta proviene de la **API simulada de AGIChat**.',
  ].join('\n')
}