import { ChatWidget } from "./components/ChatWidget/ChatWidget"

function App() {
  return (
    <main>
      <ChatWidget
        assistantName="Sofía"
        description="Escribe una duda y yo te ayudaré en lo que pueda"
      />
    </main>
  )
}

export default App