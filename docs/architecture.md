
# AGIChat — Arquitectura Fase 2

## Descripción general

AGIChat es un SDK de chat desarrollado con React y TypeScript que integra un agente de inteligencia artificial basado en Gemini.

El agente utiliza herramientas MCP para consultar información de películas y libros mediante TMDB y Google Books.

El backend está desarrollado con Express y contiene controles de seguridad para validar entradas, autorizar determinadas operaciones y filtrar respuestas potencialmente sensibles.

## Componentes principales

| Componente | Responsabilidad |
|---|---|
| ChatWidget | Interfaz de conversación |
| chatService | Comunicación HTTP con Express |
| Express API | Procesamiento de solicitudes |
| inputGuard | Validación de mensajes |
| movieAgent | Orquestación de Gemini y MCP |
| MCP Client | Comunicación con herramientas |
| MCP Server | Registro y ejecución de herramientas |
| tmdbService | Consulta de películas y géneros |
| googleBooksService | Consulta de libros |
| outputGuard | Validación de respuestas |
| securityEvals | Evaluaciones LLM01 y LLM07 |

## Diagrama de arquitectura

```mermaid
flowchart TD
    A["Usuario"] --> B["AGIChat SDK - React Widget"]
    B --> C["chatService"]
    C --> D["Express API"]
    D --> E["Input Guard"]
    E --> F["Gemini Agent"]
    F <--> G["Gemini API"]
    F <--> H["MCP Client"]
    H <--> I["MCP Server"]
    I --> J["TMDB Service"]
    I --> K["Google Books Service"]
    J <--> L["TMDB API"]
    K <--> M["Google Books API"]
    J --> N["IMDb Reference"]
    F --> O["Output Guard"]
    O --> D
    D --> P["Respuesta + Poster + Navigation"]
    P --> B
```

## Herramientas MCP

- search_movies: búsqueda de películas por título.
- discover_movies: recomendaciones por género.
- search_books: búsqueda de libros.
- get_imdb_reference: obtención de referencias de IMDb.

## Seguridad

- LLM01: validación de autorización para llamadas a herramientas y comprobación de identificadores TMDB.
- LLM07: filtrado básico de respuestas potencialmente sensibles.
- Evals: pruebas automatizadas y evaluaciones reales contra Gemini.

Estas defensas reducen riesgos específicos, pero no garantizan protección completa frente a todos los ataques.


## Flujo de ejecución del agente

El siguiente diagrama representa cómo AGIChat procesa
una solicitud, consulta herramientas MCP y aplica
controles de seguridad.

```mermaid
sequenceDiagram
    autonumber

    actor U as Usuario
    participant R as React Widget
    participant E as Express API
    participant I as Input Guard
    participant A as Gemini Agent
    participant G as Gemini API
    participant C as MCP Client
    participant M as MCP Server
    participant S as Servicios Externos
    participant O as Output Guard

    U->>R: Envía mensaje
    R->>E: POST /api/chat

    E->>I: Validar entrada

    alt Entrada inválida
        I-->>E: Rechazar solicitud
        E-->>R: HTTP 400
    else Entrada válida
        I-->>E: Entrada aceptada
        E->>A: generateMovieResponse()
        A->>G: Enviar mensaje y herramientas

        opt Gemini solicita herramienta
            G-->>A: Function Call
            A->>A: Validar argumentos y autorización

            alt Operación autorizada
                A->>C: callTool()
                C->>M: Ejecutar herramienta
                M->>S: Consultar API
                S-->>M: Resultados
                M-->>C: Respuesta MCP
                C-->>A: Datos externos
            else Operación no autorizada
                A->>A: Bloquear operación
            end

            A->>G: Enviar resultado de herramienta
        end

        G-->>A: Respuesta final
        A->>O: Validar respuesta

        alt Contenido sensible detectado
            O-->>A: Bloquear contenido
            A-->>E: Mensaje seguro
        else Respuesta permitida
            O-->>A: Aprobada
            A-->>E: Respuesta generada
        end

        E-->>R: JSON con mensaje y datos opcionales
        R-->>U: Mostrar respuesta
    end
```

### Controles de seguridad

**LLM01 - Prompt Injection**

El agente valida las llamadas a herramientas MCP.
Para consultar referencias de IMDb, verifica que
el usuario haya solicitado la apertura y que el
identificador corresponda a una búsqueda previa
de TMDB.

Los resultados de APIs externas se consideran
información no confiable.

**LLM07 - System Prompt Leakage**

Antes de devolver la respuesta final, el agente
utiliza outputGuard para detectar determinados
patrones de información sensible.

Si encuentra uno, sustituye la respuesta por
un mensaje seguro.

### Respuestas del backend

La API puede devolver:

- message: respuesta textual del agente.
- posterUrl: dirección del póster de TMDB.
- movieTitle: título de la película.
- navigation: referencia autorizada para abrir
  IMDb o Google Books.

Los campos adicionales son opcionales.

### Limitaciones

Los controles implementados reducen riesgos
específicos, pero no garantizan protección total
contra prompt injection ni filtraciones.

Las evaluaciones de seguridad documentan los
escenarios comprobados y sus resultados.
