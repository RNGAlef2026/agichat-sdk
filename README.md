# AGIChat SDK

AGIChat SDK es un widget de chat reutilizable desarrollado con React y TypeScript que permite integrar asistentes de inteligencia artificial en aplicaciones web.

El proyecto utiliza una arquitectura desacoplada entre frontend y backend, incorporando un agente basado en Google Gemini y herramientas MCP (Model Context Protocol) para consultar información externa.

Actualmente, el asistente Sofía puede buscar películas, recomendar películas por género, consultar libros, comparar obras literarias con sus adaptaciones cinematográficas y abrir referencias de IMDb y Google Books.

El proyecto también incorpora controles de seguridad, pruebas automatizadas, evaluaciones de modelos de lenguaje y CI/CD mediante GitHub Actions.

## 1. Características principales

### Frontend y SDK

- Widget de chat reutilizable y configurable.
- Interfaz responsive desarrollada con React.
- Mensajes diferenciados entre usuario y asistente.
- Renderizado de Markdown y GitHub Flavored Markdown.
- Visualización de pósteres obtenidos mediante TMDB.
- Estados de carga y manejo de errores.
- Apertura automática de referencias externas autorizadas.
- API pública tipada mediante TypeScript.
- Distribución independiente como SDK.

### Agente de inteligencia artificial

- Integración con Google Gemini.
- Backend desarrollado con Express.
- Comunicación mediante Model Context Protocol.
- Búsqueda de películas utilizando TMDB.
- Recomendaciones de películas por género.
- Búsqueda de libros utilizando Google Books.
- Comparación de películas con sus libros originales.
- Obtención de referencias verificadas de IMDb.
- Generación de respuestas en español.

### Calidad y seguridad

- Pruebas automatizadas con Vitest.
- React Testing Library para componentes.
- Cobertura global mínima del 80%.
- Validación de entradas y respuestas.
- Controles de autorización de herramientas MCP.
- Defensas básicas para LLM01 y LLM07.
- Evaluaciones reales contra Gemini.
- Reportes JSON de seguridad.
- Integración y distribución continua mediante GitHub Actions.

---

## 2. Stack tecnológico

| Área | Tecnologías |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express |
| Inteligencia artificial | Google Gemini |
| Herramientas | MCP SDK, Zod |
| Películas | TMDB API |
| Libros | Google Books API |
| Markdown | react-markdown, remark-gfm |
| Testing | Vitest, React Testing Library |
| Mocking | MSW, Vitest |
| Seguridad | Input Guard, Output Guard |
| Calidad | ESLint, TypeScript |
| CI/CD | GitHub Actions |

---

## 3. Requisitos

Para ejecutar AGIChat localmente se necesita:

- Node.js 24.
- npm.
- Git.
- Credenciales válidas para Google Gemini.
- Token de acceso de TMDB.
- API key de Google Books.

Las credenciales deben mantenerse privadas y nunca incluirse directamente en el código fuente.

---

## 4. Instalación

Clonar el repositorio:

```bash
git clone https://github.com/RNGAlef2026/agichat-sdk.git
```

Entrar al proyecto:

```bash
cd agichat-sdk
```

Instalar las dependencias:

```bash
npm ci
```

### Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Se puede utilizar `.env.example` como referencia.

Variables necesarias:

```env
GEMINI_API_KEY=your_gemini_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

Las variables se utilizan desde el backend y no deben exponerse mediante variables públicas de Vite.

**Importante:** el archivo `.env` no debe subirse al repositorio.

---

## 5. Ejecutar AGIChat

La aplicación utiliza dos procesos de desarrollo.

### Terminal 1 — Backend

```bash
npm run server:dev
```

El servidor Express estará disponible normalmente en:

```text
http://localhost:3001
```

### Terminal 2 — Frontend

```bash
npm run dev
```

La aplicación React estará disponible normalmente en:

```text
http://localhost:5173
```

Abrir la dirección del frontend en el navegador para utilizar Sofía.

El frontend envía solicitudes al endpoint `/api/chat`, atendido por el backend.

---

## 6. Uso del widget

AGIChat expone `ChatWidget` como parte de su API pública.

```tsx
import { ChatWidget } from 'agichat-sdk'
import 'agichat-sdk/style.css'

function App() {
  return (
    <ChatWidget
      assistantName="Sofía"
      description="Escribe una duda y yo te ayudaré en lo que pueda."
    />
  )
}

export default App
```

### Propiedades

| Propiedad | Tipo | Requerida | Valor predeterminado |
|---|---|---|---|
| assistantName | string | No | Sofía |
| description | string | No | Escribe una duda y yo te ayudaré en lo que pueda. |

También puede utilizarse sin propiedades adicionales:

```tsx
<ChatWidget />
```

El widget utiliza `chatService` para comunicarse con el endpoint del chat.

Para utilizar el agente real, la aplicación anfitriona debe proporcionar acceso al backend correspondiente.

---

## 7. API del chat

### Endpoint

```text
POST /api/chat
```

### Request

```json
{
  "message": "Recomiéndame películas de ciencia ficción"
}
```

### Response

La API devuelve una respuesta JSON con el mensaje del asistente y, cuando corresponde, información adicional.

```json
{
  "message": "Te recomiendo Interstellar.",
  "movieTitle": "Interstellar",
  "posterUrl": "https://image.tmdb.org/t/p/w500/example.jpg"
}
```

El ejemplo anterior es ilustrativo.

### Navegación

Cuando el usuario solicita abrir una referencia autorizada, la respuesta también puede incluir:

```json
{
  "message": "Encontré la referencia de Interstellar.",
  "navigation": {
    "type": "open_reference",
    "provider": "imdb",
    "url": "https://www.imdb.com/title/tt0816692/"
  }
}
```

Los campos `movieTitle`, `posterUrl` y `navigation` son opcionales.

El frontend valida las URLs antes de realizar la navegación.

---

## 8. Arquitectura

AGIChat utiliza una arquitectura modular que separa la presentación, la lógica del agente, las herramientas MCP y los servicios externos.

```text
Usuario
   |
   v
React ChatWidget
   |
   v
chatService
   |
   v
Express API
   |
   v
Input Guard
   |
   v
Gemini Agent <----> Gemini API
   |
   v
MCP Client
   |
   v
MCP Server
   |
   +----> TMDB Service ----> TMDB API
   |
   +----> Google Books Service ----> Google Books API
```

El agente utiliza `outputGuard` antes de entregar la respuesta final.

El backend también puede devolver información de pósteres y acciones de navegación al widget.

### Documentación de arquitectura

Consultar [Arquitectura de AGIChat](docs/architecture.md).

Incluye:

- Diagrama general de arquitectura.
- Diagrama de secuencia Gemini + MCP.
- Descripción de componentes.
- Herramientas y servicios externos.
- Controles de seguridad.

---

## 9. Herramientas MCP

El servidor MCP de AGIChat proporciona cuatro herramientas principales.

| Herramienta | Función | Fuente |
|---|---|---|
| search_movies | Buscar películas por título | TMDB |
| discover_movies | Descubrir películas por género | TMDB |
| search_books | Buscar libros y obtener referencias | Google Books |
| get_imdb_reference | Obtener referencias IMDb mediante identificadores TMDB | TMDB |

Las herramientas utilizan esquemas de validación para controlar sus argumentos.

El agente puede ejecutar varias rondas de herramientas durante una conversación.

### Recomendaciones por género

`discover_movies` permite consultar películas por categorías como ciencia ficción, acción, terror, comedia, drama, fantasía y otras.

Los resultados se obtienen desde TMDB y se ordenan por calificación, utilizando filtros adicionales para mejorar la selección.

---

## 10. Seguridad

AGIChat incorpora controles enfocados en riesgos asociados a aplicaciones con modelos de lenguaje.

### LLM01 — Prompt Injection

Se implementaron controles para reducir la posibilidad de que instrucciones maliciosas provoquen acciones no autorizadas.

Entre ellos:

- Validación de mensajes.
- Comprobación de autorización antes de determinadas llamadas MCP.
- Rechazo de solicitudes de apertura no autorizadas.
- Verificación de identificadores TMDB.
- Tratamiento de datos externos como información no confiable.

### LLM07 — System Prompt Leakage

El agente incorpora instrucciones para evitar revelar información interna.

Adicionalmente, `outputGuard` detecta determinados patrones sensibles en las respuestas generadas.

Cuando identifica contenido potencialmente confidencial, devuelve un mensaje alternativo.

Estas defensas son parciales y no garantizan protección absoluta.

### Evaluaciones de seguridad

Se implementaron escenarios para LLM01 y LLM07, utilizando pruebas automatizadas y solicitudes reales al backend.

En la ejecución documentada del 14 de noviembre de 2026:

| Métrica | Resultado |
|---|---:|
| Evals ejecutadas | 4 |
| Comprobaciones automáticas aprobadas | 4 |
| Fallidas | 0 |
| Errores | 0 |

Los resultados `PASS_AUTO` requieren revisión humana y no constituyen una certificación de seguridad.

Consultar [Documentación de Seguridad y Evals](docs/security-evals.md).

---

## 11. Testing y cobertura

El proyecto utiliza Vitest y React Testing Library.

Las pruebas cubren:

- Componentes React.
- Envío y recepción de mensajes.
- Estados de carga y errores.
- Renderizado Markdown.
- Pósteres y navegación.
- Servicios TMDB y Google Books.
- Herramientas MCP.
- Integración del agente.
- Validación de entradas.
- Filtrado de respuestas.
- Controles LLM01 y LLM07.

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas en modo watch

```bash
npm run test:watch
```

### Ejecutar coverage

```bash
npm run coverage
```

El proyecto exige una cobertura global mínima del 80% en:

- Statements.
- Branches.
- Functions.
- Lines.

Los evaluadores independientes de seguridad se ejecutan por separado de las pruebas unitarias.

### TypeScript del backend

```bash
npm run typecheck:server
```

### ESLint

```bash
npm run lint
```

---

## 12. Evals reales con Gemini

Para ejecutar las evaluaciones de seguridad, primero iniciar el backend:

```bash
npm run server:dev
```

Después, en otra terminal:

```bash
npx tsx server/evals/securityEvals.ts
```

El evaluador ejecuta escenarios contra el endpoint real del chat.

Los reportes se generan localmente en:

```text
reports/security/
```

Los reportes incluyen resultados automáticos, comportamientos esperados y limitaciones.

Esta carpeta está excluida del repositorio para evitar publicar información sin revisión.

Las evaluaciones consumen solicitudes reales de Gemini y pueden estar sujetas a cuotas de API.

---

## 13. Build y distribución

### Build de la aplicación demo

```bash
npm run build
```

Genera la aplicación optimizada en:

```text
dist/
```

### Build del SDK

```bash
npm run build:lib
```

Genera la distribución de la librería en:

```text
dist-lib/
```

Incluye JavaScript, estilos CSS y declaraciones TypeScript.

### Verificar el paquete

```bash
npm pack --dry-run
```

Permite inspeccionar los archivos que formarían parte del paquete sin publicarlo.

### Versión

La versión inicial del SDK es `0.1.0`.

El paquete se mantiene privado para evitar publicaciones accidentales en registros externos.

---

## 14. CI/CD

AGIChat utiliza GitHub Actions para automatizar las validaciones.

El flujo de integración continua incluye:

```text
Checkout
   |
npm ci
   |
ESLint
   |
Tests
   |
Coverage >= 80%
   |
Build
```

Los cambios deben superar las verificaciones configuradas antes de integrarse a `main`.

### Distribución continua

El workflow de distribución genera el paquete SDK y lo publica como artifact de GitHub Actions.

Esto permite descargar la distribución sin publicarla en npm.

---

## 15. GitHub Flow

El desarrollo utiliza ramas independientes para nuevas funcionalidades, correcciones y documentación.

```text
main
  |
  v
feature / fix / docs
  |
  v
Commits
  |
  v
Pull Request
  |
  v
CI
  |
  v
Merge a main
```

Los cambios deben desarrollarse y validarse antes de integrarse a la rama principal.

---

## 16. Estructura del proyecto

```text
agichat-sdk/
├── public/
│   └── tmdb-logo.svg
├── src/
│   ├── components/
│   │   ├── ChatHeader/
│   │   ├── ChatInput/
│   │   ├── ChatMessage/
│   │   ├── ChatWidget/
│   │   └── MessageList/
│   ├── mocks/
│   ├── services/
│   ├── test/
│   ├── types/
│   ├── App.tsx
│   ├── index.ts
│   └── main.tsx
├── server/
│   ├── agents/
│   │   ├── movieAgent.ts
│   │   └── movieMedia.ts
│   ├── evals/
│   │   └── securityEvals.ts
│   ├── mcp/
│   │   └── movieServer.ts
│   ├── security/
│   │   ├── inputGuard.ts
│   │   └── outputGuard.ts
│   ├── services/
│   │   ├── tmdbService.ts
│   │   └── googleBooksService.ts
│   ├── app.ts
│   └── index.ts
├── docs/
│   ├── architecture.md
│   └── security-evals.md
├── .github/
│   └── workflows/
├── AGENTS.md
├── package.json
└── README.md
```

Los archivos de pruebas se encuentran junto a los componentes y servicios correspondientes.

---

## 17. Documentación adicional

- [Arquitectura de Fase 2](docs/architecture.md)
- [Seguridad y evaluaciones LLM01/LLM07](docs/security-evals.md)
- `AGENTS.md`: convenciones y reglas de desarrollo agéntico.

La documentación de la Fase 1 puede conservarse como referencia histórica.

---

## 18. Atribución de TMDB

AGIChat utiliza información proporcionada por The Movie Database (TMDB).

**This product uses the TMDB API but is not endorsed or certified by TMDB.**

El proyecto incorpora el logotipo de TMDB y su correspondiente aviso de atribución.

Sitio oficial: https://www.themoviedb.org/

---

## 19. Estado del proyecto

AGIChat Fase 2 incorpora un agente funcional con integración de herramientas MCP, consultas externas, recomendaciones de películas, referencias y controles básicos de seguridad.

Las funcionalidades principales se han validado mediante pruebas automatizadas y pruebas funcionales desde el navegador.

Las defensas y evaluaciones de seguridad deben continuar ampliándose para cubrir escenarios más complejos.

El proyecto conserva una arquitectura modular para facilitar futuras mejoras y la reutilización del SDK.
