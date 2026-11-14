import { ChatWidget } from './components/ChatWidget/ChatWidget'

function App() {
  return (
    <main>
      <ChatWidget
        assistantName="Sofía"
        description="Escribe una duda y yo te ayudaré en lo que pueda"
      />

      <footer aria-label="Atribución de TMDB">
        <small>
          This product uses the{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            TMDB API
          </a>
          {' '}but is not endorsed or certified by TMDB.
        </small>
      </footer>
    </main>
  )
}

export default App
