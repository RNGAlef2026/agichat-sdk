import { useState, type FormEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({
  onSendMessage,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || disabled) {
      return
    }

    onSendMessage(trimmedMessage)
    setMessage('')
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <label className="chat-input__label" htmlFor="chat-message">
        Mensaje
      </label>

      <input
        id="chat-message"
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Escribe un mensaje..."
        disabled={disabled}
        autoComplete="off"
      />

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Enviar mensaje"
      >
        →
      </button>
    </form>
  )
}