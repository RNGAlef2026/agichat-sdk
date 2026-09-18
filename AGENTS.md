# AGENTS.md

Este archivo contiene las instrucciones que deben seguir las herramientas de desarrollo agéntico que trabajen sobre este repositorio.

El objetivo es mantener una base de código consistente, mantenible, probada y compatible con la arquitectura definida para AGIChat SDK.

## 1. Contexto del proyecto

AGIChat SDK es un widget de chat reutilizable construido para proporcionar una interfaz gráfica a sistemas agénticos.

En la primera fase, la aplicación utiliza una API simulada para generar respuestas. La arquitectura debe permitir sustituir esta implementación por un agente real en fases posteriores sin reescribir los componentes principales de la interfaz.

Antes de realizar cambios significativos en la arquitectura, consultar la documentación disponible en:

`docs/ARQUITECTURA.md`

## 2. Stack tecnológico

El proyecto utiliza:

- React
- TypeScript
- Vite
- CSS
- Vitest
- React Testing Library
- Mock Service Worker (MSW)
- React Markdown
- ESLint
- GitHub Actions

No agregar frameworks, librerías o dependencias adicionales a menos que exista una necesidad clara que no pueda resolverse razonablemente con las herramientas existentes.

## 3. Comandos del proyecto

Instalar dependencias:

```bash
npm ci
```

Ejecutar el entorno de desarrollo:

```bash
npm run dev
```

Ejecutar lint:

```bash
npm run lint
```

Ejecutar las pruebas:

```bash
npm test
```

Ejecutar pruebas en modo watch:

```bash
npm run test:watch
```

Generar el reporte de cobertura:

```bash
npm run coverage
```

Generar el build de producción:

```bash
npm run build
```

Antes de considerar terminado cualquier cambio de código, se deben ejecutar como mínimo:

```bash
npm run lint
npm test
npm run build
```

Cuando existan suficientes pruebas para medir la cobertura del código modificado, también debe ejecutarse:

```bash
npm run coverage
```

El proyecto requiere mantener una cobertura mínima de 80%.

## 4. Reglas de arquitectura

El código debe respetar la separación de responsabilidades definida por el proyecto.

La estructura objetivo es:

```text
src/
├── components/
├── hooks/
├── services/
├── mocks/
├── types/
└── test/
```

### Componentes

Los componentes React pertenecen a `src/components/`.

Los componentes deben enfocarse principalmente en presentación e interacción con el usuario. No deben implementar directamente detalles de comunicación con APIs externas.

Evitar componentes excesivamente grandes. Cuando un componente tenga múltiples responsabilidades independientes, dividirlo en componentes más pequeños.

### Hooks

La lógica reutilizable relacionada con React puede extraerse a `src/hooks/`.

No crear hooks únicamente para mover código de lugar. Un hook debe representar comportamiento reutilizable o permitir separar claramente lógica de presentación.

### Servicios

Toda comunicación con servicios externos debe abstraerse dentro de `src/services/`.

Los componentes no deben realizar directamente llamadas como:

```ts
fetch('/api/chat')
```

En su lugar, deben utilizar la capa de servicios correspondiente.

La interfaz gráfica no debe depender de si las respuestas provienen de MSW, un backend HTTP o un agente real.

### Mocks

Los endpoints simulados y handlers de MSW pertenecen a `src/mocks/`.

La lógica del mock no debe mezclarse con componentes ni utilizarse como lógica de producción.

### Tipos

Los tipos e interfaces compartidos relacionados con el dominio del chat pertenecen a `src/types/`.

Evitar el uso de `any`. Cuando la forma de los datos sea conocida, definir un tipo o interfaz explícita.

## 5. Flujo esperado del chat

Mantener el siguiente flujo de dependencias:

```text
Usuario
   ↓
Componentes
   ↓
Lógica del chat
   ↓
Servicio de chat
   ↓
API
```

La respuesta debe regresar por las mismas abstracciones antes de actualizar la interfaz.

No crear dependencias directas desde los componentes hacia la implementación del mock.

## 6. Mensajes y Markdown

Los mensajes del chat deben distinguir claramente su origen, por ejemplo usuario o asistente.

Las respuestas del asistente pueden contener Markdown y deben renderizarse mediante la solución de Markdown configurada en el proyecto.

No renderizar contenido Markdown mediante HTML sin procesar ni introducir mecanismos innecesarios que eviten las protecciones proporcionadas por las librerías utilizadas.

## 7. Pruebas

Todo comportamiento relevante debe estar cubierto por pruebas automatizadas.

Utilizar:

- Vitest como test runner.
- React Testing Library para componentes.
- `user-event` para simular interacciones del usuario.

Las pruebas deben validar comportamiento observable y evitar depender innecesariamente de detalles internos de implementación.

Como mínimo, deben probarse:

- Renderizado de componentes.
- Interacción con el campo de entrada.
- Envío de mensajes.
- Respuestas del servicio.
- Estados de carga.
- Manejo de errores.
- Renderizado de Markdown.
- Casos límite relevantes.

No eliminar pruebas ni reducir los thresholds de cobertura para hacer que CI pase.

El proyecto requiere como mínimo:

- 80% de líneas.
- 80% de funciones.
- 80% de ramas.
- 80% de sentencias.

## 8. Convenciones de código

Mantener el código simple y legible.

Seguir estas reglas:

- Utilizar TypeScript para el código de la aplicación.
- Evitar `any`.
- Preferir nombres descriptivos para variables, funciones y componentes.
- Mantener funciones pequeñas y con una responsabilidad clara.
- Evitar duplicación innecesaria.
- No agregar abstracciones sin una necesidad concreta.
- No dejar código comentado que ya no se utilice.
- No dejar `console.log` de depuración en cambios terminados.
- Mantener las reglas existentes de ESLint.
- Reutilizar las dependencias existentes antes de agregar una nueva.

Los componentes React deben utilizar nombres en PascalCase:

```text
ChatWidget
ChatMessage
ChatInput
```

Las funciones, variables y servicios deben utilizar camelCase:

```text
sendMessage
chatService
isLoading
```

Los tipos e interfaces deben utilizar nombres descriptivos en PascalCase:

```text
ChatMessage
ChatService
AssistantConfig
```

## 9. Git y GitHub Flow

El proyecto utiliza GitHub Flow.

No desarrollar nuevas funcionalidades directamente sobre `main`.

Cada cambio debe realizarse en una rama con un nombre descriptivo, por ejemplo:

```text
feature/chat-widget
feature/mock-api
fix/message-rendering
test/chat-service
docs/project-architecture
chore/testing-setup
```

Los commits deben ser pequeños y representar cambios coherentes.

Utilizar mensajes descriptivos. Se recomienda el formato:

```text
tipo: descripción
```

Ejemplos:

```text
feat: add chat input component
fix: prevent empty messages
test: add chat service tests
docs: update architecture diagram
ci: add coverage check
```

Los cambios destinados a `main` deben pasar por Pull Request y por los checks de CI configurados para el repositorio.

No realizar force push sobre `main`.

## 10. Reglas para herramientas agénticas

Antes de modificar código:

1. Revisar los archivos relacionados con el cambio.
2. Revisar los tipos y abstracciones existentes.
3. Mantener la arquitectura definida en este documento y en `docs/ARQUITECTURA.md`.
4. Preferir modificar código existente antes de introducir una nueva dependencia o abstracción.

Después de modificar código:

1. Ejecutar lint.
2. Ejecutar las pruebas relacionadas.
3. Ejecutar el build.
4. Ejecutar coverage cuando corresponda.
5. Revisar que no se hayan agregado archivos generados o dependencias innecesarias.

Una herramienta agéntica no debe:

- Cambiar la arquitectura global sin justificación.
- Reducir los thresholds de coverage.
- Deshabilitar reglas de lint únicamente para hacer pasar un check.
- Eliminar pruebas que estén fallando sin determinar primero la causa.
- Agregar dependencias sin necesidad concreta.
- Introducir secretos, tokens o credenciales en el repositorio.
- Modificar archivos no relacionados con la tarea sin una razón clara.
- Realizar cambios directamente en `main`.