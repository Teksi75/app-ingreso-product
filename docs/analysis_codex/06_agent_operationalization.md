# 06 - Operacionalizacion del sistema agentico

> Objetivo: convertir agentes documentales en agentes operativos sin acoplarlos al runtime de usuario final.

## Veredicto ejecutivo

Los agentes deben operar primero como pipeline de desarrollo, no dentro de la app de practica. Su funcion natural es validar cambios de producto, codigo y contenido antes de implementarlos o mergearlos. El primer agente ejecutable debe ser Product Guardian, porque decide si activar los demas.

## Arquitectura propuesta

```text
input humano / diff / archivos cambiados
  -> Product Guardian
  -> Scope & Rules Validator (si aplica)
  -> Quality Auditor (si aplica)
  -> Codex Prompt Generator (si no hay bloqueo)
  -> salida JSON + resumen Markdown
```

## Que agente se ejecuta

### Product Guardian

Ejecucion:

- Siempre.

Entrada:

- Descripcion del cambio.
- Lista opcional de archivos modificados (`git diff --name-only`).
- Tipo de operacion: idea, implementacion, refactor, contenido, fix.

Salida:

- `changeType`
- `riskLevel`
- `agentsToRun`
- `blockingIssues`
- `requiredChecks`

Interaccion con codigo:

- Lee docs de vision/alcance/ADRs.
- Clasifica por palabras clave y archivos tocados.
- No modifica archivos.

### Scope & Rules Validator

Ejecucion:

- Si Product Guardian detecta cambio de alcance, negocio, pedagogia, legal, arquitectura o contenido.

Entrada:

- Propuesta clasificada.
- Docs parseados de vision, business rules, ADRs y mapa de skills.

Salida:

- `severity`: `P0 | P1 | P2 | OK`
- violaciones
- restricciones obligatorias

Interaccion con codigo:

- Lee `docs/`, `decisions/`, `roadmap/`.
- Para contenido, puede leer `docs/04_exercise_engine/*.json`.

### Quality Auditor

Ejecucion:

- Si hay cambios en `src/`, `docs/04_exercise_engine/`, tests o flujo de practica.
- Siempre despues de generar ejercicios nuevos.

Entrada:

- Diff o lista de archivos.
- Resultado de validadores anteriores.

Salida:

- Riesgos funcionales.
- Checks requeridos.
- Bloqueos si se rompe el loop central.

Interaccion con codigo:

- Ejecuta comandos permitidos como `npm run typecheck` y tests.
- Inspecciona patrones sensibles: `PracticeQuestion`, `session_runner`, `exercise_selector`, `local_progress_store`.

### Codex Prompt Generator

Ejecucion:

- Cuando no haya P0.
- Despues de recibir restricciones.

Entrada:

- Decision consolidada.
- Archivos objetivo.
- Criterios de aceptacion.

Salida:

- Prompt ejecutable para Codex o tarea de implementacion.
- Checkpoints obligatorios.

Interaccion con codigo:

- No implementa; genera instrucciones estructuradas.

## Donde se ejecuta

### Fase 1 - CLI manual

Agregar:

- `src/agents/product_guardian.ts`
- `src/agents/pipeline.ts`
- `scripts/validate-change.ts`
- `npm run validate-change -- "descripcion"`

Ventaja:

- Bajo riesgo.
- No bloquea commits.
- Permite calibrar falsos positivos.

### Fase 2 - Check pre-PR

Agregar:

- `npm run agent-check -- --diff`

Comportamiento:

- Lee `git diff --name-only`.
- Activa Quality Auditor si se tocan archivos criticos.
- Devuelve salida JSON y Markdown.

### Fase 3 - Pre-commit opcional

Solo despues de calibrar:

- Hook no bloqueante primero: imprime advertencias.
- Hook bloqueante solo para P0 deterministico.

### Fase 4 - CI

En PR:

- Ejecutar pipeline.
- Adjuntar resumen como artefacto/comentario.
- Bloquear merge solo si hay P0.

## Contratos de datos

Crear un contrato comun:

```ts
type AgentIssue = {
  id: string;
  severity: "P0" | "P1" | "P2";
  message: string;
  evidence: string[];
  suggestedFix?: string;
};

type AgentRunResult = {
  agent: "product_guardian" | "scope_rules_validator" | "quality_auditor" | "codex_prompt_generator";
  status: "passed" | "warning" | "blocked";
  issues: AgentIssue[];
  nextAgents: string[];
};
```

## Implementacion incremental

### Slice 1

Implementar Product Guardian con heuristicas simples:

- Si toca `src/app/practice`, `src/practice`, `src/storage`: activar Quality Auditor.
- Si toca `docs/04_exercise_engine`: activar Scope & Rules Validator y Quality Auditor.
- Si la descripcion incluye "nuevo modulo", "pago", "login", "contenido oficial": marcar riesgo alto.
- Si solo toca docs de analisis: permitir con advertencia.

### Slice 2

Implementar Scope & Rules Validator:

- Cargar reglas desde docs y ADRs.
- Buscar violaciones deterministicas: contenido oficial, alcance fuera de Lengua, responsabilidad parental, claims no soportados.

### Slice 3

Implementar Quality Auditor:

- Mapear archivos criticos a checks:
  - `PracticeQuestion.tsx`: typecheck + e2e practica.
  - `session_runner.ts` / `exercise_selector.ts`: integration test de lengua.
  - `local_progress_store.ts`: test de persistencia.

### Slice 4

Agregar Codex Prompt Generator:

- Convierte el resultado del pipeline en una tarea lista para implementar.

## Decision

No ejecutar agentes en runtime de la app por ahora. La app necesita practicar Lengua; los agentes deben gobernar cambios del producto y contenido. Esa separacion evita acoplar UX educativa a validadores de desarrollo.
