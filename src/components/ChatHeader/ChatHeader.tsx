interface ChatHeaderProps {
  assistantName: string
  description: string
}

export function ChatHeader({
  assistantName,
  description,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__avatar" aria-hidden="true">
        ✦
      </div>

      <h1>¡Hola! Soy tu asistente virtual {assistantName}</h1>

      <p>{description}</p>
    </header>
  )
}