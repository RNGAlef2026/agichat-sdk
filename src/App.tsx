
import { ChatWidget } from './components/ChatWidget/ChatWidget'

function App() {
  return (
    <main>
      <ChatWidget
        assistantName="Sofía"
        description="Escribe una duda y yo te ayudaré en lo que pueda"
      />

      <footer aria-label="Créditos y atribuciones">
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar The Movie Database"
        >
          <img
            src="/tmdb-logo.svg"
            alt="TMDB - The Movie Database"
            width="120"
          />
        </a>

        <p>
          <small>
            This product uses the TMDB API but is not
            endorsed or certified by TMDB.
          </small>
        </p>
      </footer>
    </main>
  )
}

export default App
