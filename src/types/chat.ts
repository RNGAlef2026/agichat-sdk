export type MessageRole = 'user' | 'assistant'

export interface NavigationAction {
  type: 'open_reference'
  provider: 'imdb' | 'google_books'
  url: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  posterUrl?: string
  movieTitle?: string
}

export interface SendMessageRequest {
  message: string
}

export interface SendMessageResponse {
  message: string
  posterUrl?: string
  movieTitle?: string
  navigation?: NavigationAction
}

export interface ChatService {
  sendMessage(message: string): Promise<SendMessageResponse>
}

export interface ChatWidgetProps {
  assistantName?: string
  description?: string
}