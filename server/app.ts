
import express from 'express'
import { generateMovieResponse } from './agents/movieAgent'

export const app = express()

app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AGIChat Backend',
  })
})

app.post('/api/chat', async (req, res) => {
  const body: unknown = req.body

  if (
    typeof body !== 'object' ||
    body === null ||
    !('message' in body) ||
    typeof body.message !== 'string' ||
    !body.message.trim() ||
    body.message.length > 2000
  ) {
    res.status(400).json({
      error: 'El mensaje debe contener entre 1 y 2000 caracteres.',
    })
    return
  }

  try {
    const message = await generateMovieResponse(body.message)

    res.json({ message })
  } catch (error) {
    console.error(
      'Error del agente:',
      error instanceof Error ? error.message : 'Error desconocido',
    )

    res.status(502).json({
      error: 'No fue posible generar una respuesta.',
    })
  }
})
