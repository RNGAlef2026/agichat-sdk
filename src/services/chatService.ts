import type {
  ChatService,
  SendMessageRequest,
  SendMessageResponse,
} from '../types/chat'

const CHAT_ENDPOINT = '/api/chat'

export const chatService: ChatService = {
  async sendMessage(message: string): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      message,
    }

    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('No fue posible obtener una respuesta del asistente.')
    }

    return response.json() as Promise<SendMessageResponse>
  },
}