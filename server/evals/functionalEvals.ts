import { mkdir, writeFile} from 'node:fs/promises'
import {join } from 'node:path'

type FunctionalEvalStatus =
  | 'PASS_AUTO'
  | 'FAIL_AUTO'
  | 'ERROR'

interface FunctionalEvalCase {
  id: string
  prompt: string
  expectedTools: string[]
  expectedKeywords: string[]
}

interface FunctionalEvalResult {
  id: string
  status: FunctionalEvalStatus
  expectedTools: string[]
  matchedKeywords: string[]
  manualReviewRequired: boolean
  responseLength: number
  error?: string
}

const API_URL = 'http://localhost:3001/api/chat'

const cases: FunctionalEvalCase[] = [
  {
    id: 'FUNC-01',
    prompt:
      'Busca la película Interstellar utilizando TMDB.',
    expectedTools: ['search_movies'],
    expectedKeywords: ['Interstellar'],
  },
  {
    id: 'FUNC-02',
    prompt:
      'Recomiéndame 5 películas de ciencia ficción utilizando TMDB.',
    expectedTools: ['discover_movies'],
    expectedKeywords: ['película'],
  },
  {
    id: 'FUNC-03',
    prompt:
      'Busca el libro El Hobbit de J. R. R. Tolkien en Google Books.',
    expectedTools: ['search_books'],
    expectedKeywords: ['Hobbit'],
  },
  {
    id: 'FUNC-04',
    prompt:
      'Compara la película Harry Potter y la piedra filosofal con su libro original.',
    expectedTools: ['search_movies', 'search_books'],
    expectedKeywords: ['Harry Potter'],
  },
]

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

async function runFunctionalEval(
  testCase: FunctionalEvalCase,
): Promise<FunctionalEvalResult> {
  const baseResult = {
    id: testCase.id,
    expectedTools: testCase.expectedTools,
    manualReviewRequired: true,
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testCase.prompt,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      throw new Error(
        `Backend HTTP ${response.status}`,
      )
    }

    const data: unknown = await response.json()

    if (
      typeof data !== 'object' ||
      data === null ||
      !('message' in data) ||
      typeof data.message !== 'string'
    ) {
      throw new Error('Respuesta inválida del backend')
    }

    const message = data.message
    const normalizedMessage = normalizeText(message)

    const matchedKeywords =
      testCase.expectedKeywords.filter((keyword) =>
        normalizedMessage.includes(
          normalizeText(keyword),
        ),
      )

    const passed =
      message.trim().length > 0 &&
      matchedKeywords.length ===
        testCase.expectedKeywords.length

    return {
      ...baseResult,
      status: passed ? 'PASS_AUTO' : 'FAIL_AUTO',
      matchedKeywords,
      responseLength: message.length,
    }
  } catch (error) {
    return {
      ...baseResult,
      status: 'ERROR',
      matchedKeywords: [],
      responseLength: 0,
      error:
        error instanceof Error
          ? error.name
          : 'UnknownError',
    }
  }
}

async function main() {
  const results: FunctionalEvalResult[] = []

  console.log('AGIChat Functional Evals')
  console.log('Evaluando comportamiento del agente')

  for (const testCase of cases) {
    console.log(`Evaluando ${testCase.id}...`)

    const result = await runFunctionalEval(testCase)

    results.push(result)

    console.log(`${result.id}: ${result.status}`)
    console.log(
      `Herramientas esperadas: ${result.expectedTools.join(', ')}`,
    )
  }

  const summary = {
    total: results.length,
    passedAutomaticChecks: results.filter(
      (result) => result.status === 'PASS_AUTO',
    ).length,
    failedAutomaticChecks: results.filter(
      (result) => result.status === 'FAIL_AUTO',
    ).length,
    errors: results.filter(
      (result) => result.status === 'ERROR',
    ).length,
  }

  const report = {
    project: 'AGIChat',
    evaluation: 'Functional Agent Evals',
    executedAt: new Date().toISOString(),
    methodology:
      'Black-box evaluation against the real AGIChat backend.',
    limitations: [
      'Automatic checks validate response content only.',
      'Tool execution is not verified automatically.',
      'Expected MCP tools require manual log inspection.',
      'Model responses may vary between executions.',
    ],
    summary,
    results,
  }

  const outputDirectory = join(
    process.cwd(),
    'reports',
    'functional',
  )

  await mkdir(outputDirectory, {
    recursive: true,
  })

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')

  const outputPath = join(
    outputDirectory,
    `functional-evals-${timestamp}.json`,
  )

  await writeFile(
    outputPath,
    JSON.stringify(report, null, 2),
    'utf8',
  )

  console.log('\nResumen:')
  console.log(summary)
  console.log(`Reporte generado: ${outputPath}`)

  if (
    summary.failedAutomaticChecks > 0 ||
    summary.errors > 0
  ) {
    process.exitCode = 1
  }
}

void main().catch((error: unknown) => {
  console.error(
    'No fue posible completar las evaluaciones:',
    error instanceof Error ? error.message : error,
  )

  process.exitCode = 1
})
