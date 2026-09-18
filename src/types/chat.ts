export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
    id: string
    role: MessageRole
    content: string
}

export interface SendMessageRequest {
    message: string
}

export interface SendMessageResponse {
    message: string
}

export interface ChatService {
    SendMessage(message: string): Promise<SendMessageResponse>
}