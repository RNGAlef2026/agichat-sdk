import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('./mocks/browser')

  return worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url)

      if (url.pathname !== '/api/chat') {
        return
      }

      print.warning()
    },
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})