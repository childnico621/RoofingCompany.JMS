# JobTracker Frontend — Architecture Notes
## Part 2: Next.js Architecture & Patterns

> Este documento consolida los patrones de diseño aplicados, las decisiones de arquitectura
> y los puntos clave para defender la implementación en una evaluación técnica.

---

## Tabla de Patrones Aplicados

| Patrón | Ubicación | Qué problema resuelve | Cómo defenderlo |
|--------|-----------|----------------------|-----------------|
| **Controlled Component** | `CreateJobModal`, `CompleteJobModal`, `JobsTable`, `FilterBar.*` | Evita que los organismos tengan estado propio — el estado vive en los hooks | "El organismo no sabe de dónde viene el dato, solo lo renderiza. Esto facilita testing (puedo pasar cualquier valor como prop) y cumple el principio S de SOLID (un componente = una responsabilidad: renderizar)." |
| **Compound Component** | `job-filter-bar.component.tsx` — `FilterBar`, `FilterBar.Status`, `FilterBar.Search`, `FilterBar.Reset` | Permite componer sub-componentes libremente sin prop drilling, usando contexto interno | "El contexto `FilterBarContext` comparte `onReset` a `FilterBar.Reset` sin pasarlo por cada nivel. El consumidor puede elegir qué sub-componentes incluir y en qué orden, dando flexibilidad sin romper el encapsulamiento." |
| **useReducer (form state)** | `use-create-job.hook.ts`, `use-complete-job.hook.ts` | Centraliza la lógica de transición de estado de formularios con múltiples campos relacionados | "Con `useState` individual para 6 campos obtendrías 6 setters, sincronización manual y lógica dispersa. `useReducer` agrupa todo: el estado inicial, las transiciones y la lógica de reset en un solo lugar predecible." |
| **Optimistic Update + Rollback** | `use-create-job.hook.ts` L.73-96, `use-complete-job.hook.ts` L.80-105 | Muestra el resultado esperado inmediatamente (sin esperar la respuesta del servidor), revierte si falla | "El Redux store tiene `optimisticUpdates: Record<id, {status}>`. El selector `makeSelectFilteredJobs` aplica estos overrides sobre los datos reales. Si el Server Action falla, `rollbackOptimisticUpdate` elimina el override." |
| **Factory Selector (useMemo)** | `use-jobs-page.hook.ts` L.29-32 | El selector necesita capturar `localJobs` como closure; `useMemo` garantiza que solo se recrea cuando cambia la referencia | "`makeSelectFilteredJobs(localJobs)` retorna un selector memoizado con `createSelector`. Si lo creo sin `useMemo`, se recrea en cada render, perdiendo la memoización de `createSelector` y causando re-renders innecesarios." |
| **Error Boundary (class component)** | `error-boundary.component.tsx` | Los errores de render en componentes hijos no crashean toda la página | "React requiere un class component para `componentDidCatch`. Aquí lo uso para aislar `JobsTable` — si falla (e.g. dato malformado), el header y los filtros siguen funcionando. En producción enviaría el error a Sentry." |
| **Server Component + server-only** | `app/jobs/page.tsx` | Separa el data fetching del servidor de la capa de cliente | "`import 'server-only'` hace que el build falle si este archivo es importado desde código cliente. `async/await` directo en el Server Component es más eficiente que un fetch desde el cliente porque no hay round-trip al browser." |
| **Suspense Streaming** | `app/jobs/page.tsx` L.32 + `<JobSkeleton>` | Muestra feedback inmediato al usuario mientras el Server Component resuelve | "Next.js 15 usa React 19 Streaming. `<Suspense>` permite que el HTML inicial se envíe al browser con el skeleton, y el contenido real se inyecta cuando la promesa resuelve. Mejor UX que un spinner global." |
| **Verb Slices (FSD)** | `features/create-job/`, `features/filter-jobs/`, `features/complete-job/` | Organización por "qué hace el usuario" en vez de por tipo de archivo | "FSD con verb slices: el nombre de la carpeta es una acción del usuario (verbo), no un tipo técnico (modal, hook). Cada slice es autocontenido: hook + componente + barrel export. Para añadir una feature nueva, no toco código existente (Open/Closed)." |
| **Barrel Exports (index.ts)** | `features/*/index.ts`, `presentation/views/jobs/index.ts` | Define la API pública de cada slice — los imports externos solo pasan por el index | "Si muevo un archivo dentro del slice, solo actualizo el index, no todos los importadores. Esto es encapsulamiento real: el exterior no sabe la estructura interna del slice." |
| **Ternary Rendering** | Todos los componentes | Preferido sobre `&&` para evitar renderizar `0` o `false` accidentalmente | "`condition && <Component>` en React renderiza `0` si condition es el número 0 (ej. `jobs.length && ...`). El ternario `condition ? <A> : null` es explícito sobre ambas ramas y evita bugs sutiles." |

---

## Decisiones Arquitectónicas Clave

### ¿Por qué Redux Toolkit y no Zustand?

for the assessment it doesn't matter, but for my experience i prefer Redux Toolkit because it is easear to audit and debug

### ¿Por qué el estado del servidor no está en Redux?

El rubric lo exige: *"Must NOT duplicate server state"*. Los jobs que vienen del servidor se guardan en `useState` local dentro de `useJobsPage`. Redux solo maneja **UI state**: filtros, selección, sort, y optimistic overrides.

### ¿Por qué `useState` local en `useJobsPage` y no en Redux?

El job list inicial viene de un Server Component (server-side). Duplicarlo en Redux significaría:
1. Hidratación inicial del store desde props (complejo, frágil).
2. Sincronización con el servidor (violación del principio de única fuente de verdad).

La solución: `localJobs = useState(serverJobs)` captura el dato inicial del servidor y permite mutaciones locales (add on create, update on complete). Los optimistic updates del Redux sobreescriben en el selector, no en este array.

### ¿Por qué Server Actions solo para mutaciones?

El rubric es explícito: *"Server Actions must be used ONLY for mutations. Reads/queries must be fetched in the Server Component."* Server Actions para reads romperían el modelo de streaming de Next.js 15 y añadirían un round-trip innecesario.

### ¿Por qué ErrorBoundary a nivel de tabla y no de página?

- `app/jobs/error.tsx` captura errores de **render inicial** (Server Component crashes, fetch failures).
- `ErrorBoundary` class component captura errores en **runtime del cliente** (ej. datos malformados en `JobsTable`).
- Dos niveles de aislamiento = mayor resiliencia.

---

## Flujo de datos completo

```
Server Component (page.tsx)
  │  fetches initial jobs (server-side, no round-trip)
  ↓
JobsClient (jobs-client.component.tsx) ← 'use client', thin shell
  │  receives jobs as props
  ↓
useJobsPage (hook) ← orchestrates all slices
  │
  ├─ localJobs (useState)          ← server data + new jobs added
  │
  ├─ makeSelectFilteredJobs(localJobs)  ← selector factory
  │     useSelector(selector)           ← applies filters + sort + optimistic overrides
  │
  ├─ useCreateJob()                ← useReducer + Server Action + optimistic update
  ├─ useFilterJobs()               ← dispatches setFilters to Redux
  └─ useCompleteJob()              ← useReducer + Server Action + optimistic update + rollback
```

---

## Preguntas frecuentes en defensa técnica

**P: ¿Por qué el `<JobSkeleton>` se usa tanto en `loading.tsx` como en el `<Suspense>` fallback?**
R: Para consistencia visual. Si el usuario navega directamente a `/jobs`, ve el skeleton de `loading.tsx` (route-level). Si la página carga mediante streaming React, ve el mismo componente en el `<Suspense>` fallback. Un componente, dos usos.

**P: ¿Qué pasa si el Server Action falla justo cuando el optimistic update ya se aplicó?**
R: El flujo es: `applyOptimisticUpdate` → llamada al SA → `rollbackOptimisticUpdate` si `result.success === false`. El usuario ve el cambio inmediato y, si falla, vuelve al estado anterior con un mensaje de error. No hay ventana en la que el estado quede inconsistente porque el array `localJobs` no se modifica hasta que el SA confirma éxito.

**P: ¿Por qué `createSelector` en el nivel de entity y no directamente en el hook?**
R: Separación de concerns (FSD). Los selectores son parte del **model** de la entity (`entities/job/model/`). El hook es una capa de presentación que consume ese model. Si cambio la estructura del Redux state, solo actualizo los selectores, no los hooks.

**P: ¿Cómo evitas re-renders innecesarios en `useJobsPage`?**
R: Tres capas:
1. `useMemo` en la creación del selector factory (evita recrearlo cada render).
2. `createSelector` de Reselect memoiza el resultado del selector (solo recalcula si cambió filters, sort, u optimisticUpdates).
3. `useSelector` de react-redux solo re-renderiza si el valor retornado cambió (igualdad referencial por defecto).

**P: ¿Qué agregarías con más tiempo?**
- Paginación cursor-based conectada al store.
- `useTransition` de React 19 para envolver las mutaciones y evitar que la UI se bloquee.
- Tests unitarios con `@testing-library/react` y `renderWithProviders`.
- SWR o React Query para revalidación del server state en background.
- `optimisticUpdates` con tipo más rico (no solo `status`, sino snapshot completo para rollback parcial).
