# AGIChat SDK

AGIChat SDK es un widget de chat reutilizable desarrollado con React y TypeScript para proporcionar una interfaz gráfica a sistemas agénticos.

El proyecto permite integrar una interfaz de conversación configurable en aplicaciones React y está diseñado para desacoplar la interfaz gráfica del servicio que genera las respuestas.

Durante esta primera fase, AGIChat utiliza una API simulada mediante Mock Service Worker (MSW). La arquitectura permite reemplazar posteriormente esta implementación por un agente real sin reescribir los componentes principales de la interfaz.

## Características

- Widget de chat reutilizable y configurable.
- Interfaz responsive basada en el wireframe proporcionado.
- Mensajes diferenciados entre usuario y asistente.
- Renderizado de respuestas en Markdown.
- Soporte para GitHub Flavored Markdown.
- Estado de carga durante la generación de respuestas.
- Manejo de errores del servicio.
- Mock API mediante MSW.
- Arquitectura desacoplada entre presentación y servicios.
- API pública tipada con TypeScript.
- Build independiente para distribución como SDK.
- Pruebas automatizadas con Vitest y React Testing Library.
- Cobertura mínima obligatoria del 80%.
- CI/CD mediante GitHub Actions.

## Stack tecnológico

- React
- TypeScript
- Vite
- Vitest
- React Testing Library
- Mock Service Worker
- React Markdown
- remark-gfm
- ESLint
- GitHub Actions

## Requisitos

Para ejecutar el proyecto localmente se requiere:

- Node.js 24 o compatible.
- npm.
- Git.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/RNGAlef2026/agichat-sdk.git
```

Entrar al proyecto:

```bash
cd agichat-sdk
```

Instalar las dependencias utilizando el lockfile:

```bash
npm ci
```

## Desarrollo

Ejecutar la aplicación demo:

```bash
npm run dev
```

Vite mostrará la dirección local del servidor de desarrollo, normalmente:

```text
http://localhost:5173
```

Durante el desarrollo, Mock Service Worker intercepta las peticiones dirigidas a la API simulada del chat.

## Uso del widget

AGIChat expone `ChatWidget` como parte de su API pública.

Ejemplo:

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
```

### Propiedades

| Propiedad | Tipo | Requerida | Valor predeterminado |
| --- | --- | --- | --- |
| `assistantName` | `string` | No | `Sofía` |
| `description` | `string` | No | `Escribe una duda y yo te ayudaré en lo que pueda.` |

Por lo tanto, también es válido utilizar:

```tsx
<ChatWidget />
```

## API simulada

Durante esta fase, el widget utiliza:

```text
POST /api/chat
```

Request:

```json
{
  "message": "Hola"
}
```

Response:

```json
{
  "message": "Respuesta del asistente en Markdown"
}
```

La comunicación con este endpoint se encuentra abstraída mediante la capa de servicios. Los componentes visuales no dependen directamente de MSW.

Esto permite sustituir posteriormente la API simulada por un backend o sistema agéntico real manteniendo el contrato de comunicación.

## Markdown

Las respuestas del asistente pueden contener Markdown.

Por ejemplo:

```md
## Respuesta

La respuesta es **42**.
```

AGIChat renderiza estas respuestas mediante `react-markdown` y `remark-gfm`.

## Scripts

### Desarrollo

```bash
npm run dev
```

Inicia el servidor de desarrollo.

### Lint

```bash
npm run lint
```

Verifica las reglas de estilo y calidad del código.

### Tests

```bash
npm test
```

Ejecuta la suite completa de pruebas.

### Tests en modo watch

```bash
npm run test:watch
```

Ejecuta Vitest en modo interactivo.

### Coverage

```bash
npm run coverage
```

Ejecuta las pruebas y genera el reporte de cobertura.

El proyecto exige como mínimo 80% en:

- statements;
- branches;
- functions;
- lines.

### Build de la demo

```bash
npm run build
```

Genera la aplicación demo optimizada para producción en `dist/`.

### Build del SDK

```bash
npm run build:lib
```

Genera la distribución de la librería en `dist-lib/`, incluyendo:

- JavaScript ES Module;
- estilos CSS;
- declaraciones TypeScript.

### Verificar el paquete

```bash
npm pack --dry-run
```

Permite revisar qué archivos formarían parte del paquete distribuible sin publicarlo.

## Testing

El proyecto utiliza Vitest y React Testing Library.

La suite cubre, entre otros:

- renderizado de componentes;
- configuración personalizada del widget;
- entrada y envío de mensajes;
- prevención de mensajes vacíos;
- estados de carga;
- manejo de errores;
- renderizado de Markdown;
- comunicación mediante `chatService`;
- comportamiento de la Mock API.

El pipeline de CI rechaza cambios que reduzcan cualquiera de las métricas de cobertura por debajo del 80%.

## Arquitectura

AGIChat utiliza una arquitectura por capas basada en componentes.

El flujo principal es:

```text
Usuario
   ↓
Componentes React
   ↓
Lógica del chat
   ↓
Chat Service
   ↓
API
```

Durante esta fase, MSW implementa la API simulada.

La documentación completa de arquitectura, incluyendo el diagrama Mermaid y la estructura objetivo del proyecto, se encuentra en:

```text
docs/ARQUITECTURA.md
```

## Estructura principal

```text
src/
├── components/
│   ├── ChatHeader/
│   ├── ChatInput/
│   ├── ChatMessage/
│   ├── ChatWidget/
│   └── MessageList/
├── mocks/
├── services/
├── test/
├── types/
├── App.tsx
├── index.ts
└── main.tsx
```

`src/index.ts` funciona como punto de entrada público del SDK.

## CI/CD

El proyecto utiliza GitHub Actions.

### Integración continua

Los Pull Requests ejecutan automáticamente:

```text
npm ci
   ↓
lint
   ↓
tests
   ↓
coverage >= 80%
   ↓
build
```

Un cambio que no cumpla estas verificaciones no supera correctamente el pipeline.

### Distribución continua

Cuando un cambio llega a `main`, el workflow de distribución:

1. instala las dependencias;
2. ejecuta lint;
3. ejecuta los tests;
4. verifica coverage;
5. genera la build del SDK;
6. empaqueta el SDK mediante `npm pack`;
7. publica el paquete generado como artifact de GitHub Actions.

El artifact resultante puede descargarse desde la ejecución correspondiente de `SDK Distribution`.

## GitHub Flow

El repositorio utiliza GitHub Flow.

El flujo esperado es:

```text
main
  ↓
rama descriptiva
  ↓
commits
  ↓
Pull Request
  ↓
CI
  ↓
merge a main
```

Las nuevas funcionalidades no deben desarrollarse directamente sobre `main`.

## Desarrollo agéntico

El repositorio incluye:

```text
AGENTS.md
```

Este archivo documenta las reglas que deben seguir las herramientas de desarrollo agéntico, incluyendo:

- arquitectura;
- convenciones;
- testing;
- GitHub Flow;
- validaciones obligatorias;
- restricciones sobre dependencias y cambios innecesarios.

## Documentación

- `README.md`: instalación, uso y operación del proyecto.
- `docs/ARQUITECTURA.md`: arquitectura, Mermaid, estructura y decisiones técnicas.
- `AGENTS.md`: instrucciones para herramientas de desarrollo agéntico.

## Distribución

La versión actual del SDK es:

```text
0.1.0
```

La build distribuible puede generarse mediante:

```bash
npm run build:lib
```

El proyecto se mantiene marcado como privado en `package.json` para evitar publicaciones accidentales en registries externos.

La distribución automatizada se realiza actualmente mediante artifacts de GitHub Actions.