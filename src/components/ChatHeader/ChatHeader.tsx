
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
      <div className="chat-header__identity">
        <div
          className="chat-header__avatar"
          aria-hidden="true"
        >
          ✦
        </div>

        <div className="chat-header__info">
          <h1>{assistantName}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="chat-header__status">
        <span
          className="chat-header__status-dot"
          aria-hidden="true"
        />
        <span>En línea</span>
      </div>
    </header>
  )
}
