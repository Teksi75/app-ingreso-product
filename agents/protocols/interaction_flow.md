# Interaction Flow - Sistema Simplificado de Agentes

## Proposito

Este protocolo define el flujo operativo de los 4 agentes de App Ingreso.

## Flujo obligatorio

```text
Idea
  ↓
Product Guardian (clasifica cambio)
  ↓
[opcional] Scope & Rules Validator
  ↓
[opcional] Quality Auditor
  ↓
Codex Prompt Generator
  ↓
Implementacion
```

## 1. Idea

Toda solicitud entra como idea, ajuste o cambio.

Debe identificarse:

- objetivo
- parte del sistema afectada
- documentos relacionados
- si toca codigo existente
- si cambia reglas, flujo, acceso, metricas, simulador o experiencia

## 2. Product Guardian

Product Guardian siempre actua primero.

Debe emitir:

- `CHANGE_TYPE`
- agentes activados
- razon de activacion
- documentos fuente relevantes
- siguiente paso

### CHANGE_TYPE

- `idea nueva`
- `ajuste menor`
- `cambio estructural`
- `cambio sobre codigo existente`

### Reglas de decision

### FAST PATH

Si `CHANGE_TYPE = "ajuste menor"` y no hay impacto en reglas ni arquitectura:

```text
Product Guardian
  -> saltar validadores
  -> Codex Prompt Generator
```

Condiciones obligatorias:

- no cambia reglas de producto
- no cambia reglas de negocio
- no cambia limites legales
- no cambia modelo pedagogico
- no cambia arquitectura
- no modifica acceso, datos personales, metricas, simulador ni loop de practica

Si es `ajuste menor` y no toca reglas, flujo, codigo ni comportamiento:

- puede pasar directo a Codex Prompt Generator.

Si es `idea nueva`:

- activar Scope & Rules Validator.

Si es `cambio estructural`:

- activar Scope & Rules Validator.
- activar Quality Auditor si afecta comportamiento funcional.

Si es `cambio sobre codigo existente`:

- activar Quality Auditor.
- activar Scope & Rules Validator si tambien toca reglas, acceso, flujo, legal, negocio, pedagogia o arquitectura.

## 3. Scope & Rules Validator

Actua solo cuando Product Guardian lo activa.

### Se activa si

- nueva feature
- cambio de flujo
- nueva pantalla
- modificacion de acceso
- duda sobre reglas
- cambio estructural
- riesgo legal, comercial, pedagogico, tecnico o de trazabilidad

### Debe revisar

- vision del producto
- reglas de negocio
- limites legales
- modelo pedagogico
- restricciones tecnicas
- trazabilidad documental

### Resultado

- `P0`: bloquea, no avanza.
- `P1`: corregir antes de implementar.
- `P2`: mejora, puede avanzar con nota.

## 4. Quality Auditor

Actua solo cuando Product Guardian lo activa.

### Se activa si

- se modifica codigo existente
- se altera logica del sistema
- se cambia simulador
- se afectan metricas
- se modifica motor de ejercicios
- se cambia feedback o adaptatividad
- se requiere detectar regresiones

### Debe validar

El loop:

`Pregunta -> Respuesta -> Feedback -> Ajuste -> Siguiente`

Tambien debe revisar:

- coherencia de habilidades
- estructura de ejercicios
- claridad de consignas
- calidad de distractores
- feedback breve y accionable
- simulador sin ayuda durante resolucion
- metricas por habilidad
- baja friccion de usuario

### Resultado

- regresiones detectadas
- severidad funcional `P0`, `P1` o `P2`
- correcciones necesarias
- validaciones sugeridas

## 5. Codex Prompt Generator

Actua cuando el cambio esta listo para convertirse en tarea.

No toma decisiones de producto.

Debe generar un prompt con:

- objetivo concreto
- archivos a tocar
- restricciones del producto
- criterios de aceptacion
- validaciones posteriores
- notas de Scope & Rules Validator o Quality Auditor, si existen

## 6. Implementacion

La implementacion solo puede comenzar si:

- Product Guardian clasifico el cambio.
- No hay `P0`.
- Los `P1` estan corregidos o incluidos como trabajo obligatorio.
- El prompt de Codex esta acotado.

## Formatos de comunicacion entre agentes

### Mensaje de entrada al sistema

```text
INPUT:
  solicitud: [descripcion del cambio]
  area_afectada: [vision | negocio | legal | pedagogia | tecnologia | ejercicio | simulador | metricas | flujo | acceso]
  documentos_relacionados: [lista de rutas]
  toca_codigo_existente: [si | no]
  tipo_estimado: [idea nueva | ajuste menor | cambio estructural | cambio sobre codigo existente]
```

### Product Guardian -> Scope & Rules Validator

```text
FROM: Product Guardian
TO: Scope & Rules Validator
CHANGE_TYPE: [tipo]
DECISION: NEEDS_SCOPE_RULES
REASONS: [por que se activa Scope & Rules Validator]
SOURCE_DOCS: [documentos relevantes]
PROPOSAL: [descripcion del cambio]
RISK_AREAS: [vision | negocio | legal | pedagogia | tecnologia | trazabilidad]
```

### Product Guardian -> Quality Auditor

```text
FROM: Product Guardian
TO: Quality Auditor
CHANGE_TYPE: [tipo]
DECISION: NEEDS_QUALITY_AUDIT
REASONS: [por que se activa Quality Auditor]
SOURCE_DOCS: [documentos relevantes]
PROPOSAL: [descripcion del cambio]
AFFECTED_COMPONENTS: [ejercicios | simulador | metricas | feedback | adaptatividad | flujo | acceso]
SCOPE_RULES_RESTRICTIONS: [restricciones heredadas, si Scope & Rules Validator ya paso]
```

### Scope & Rules Validator -> Codex Prompt Generator

```text
FROM: Scope & Rules Validator
TO: Codex Prompt Generator
SEVERITY: [P0 | P1 | P2 | ninguna]
DECISION: [APPROVED | APPROVED_WITH_NOTES | NEEDS_REVISION | BLOCKED]
AFFECTED_RULES: [lista de reglas afectadas]
RESTRICTIONS: [restricciones que el prompt debe incluir]
P1_CORRECTIONS: [correcciones obligatorias, si hay]
CONSULTED_DOCS: [documentos consultados]
```

### Quality Auditor -> Codex Prompt Generator

```text
FROM: Quality Auditor
TO: Codex Prompt Generator
AUDIT_RESULT: [PASS | PASS_WITH_NOTES | NEEDS_CORRECTION | BLOCKED]
SEVERITY: [P0 | P1 | P2 | ninguna]
REGRESSIONS: [lista de regresiones, o "ninguna"]
P1_CORRECTIONS: [correcciones funcionales obligatorias, si hay]
VALIDATION_RECOMMENDATIONS: [que verificar post-implementacion]
```

### Codex Prompt Generator -> Output

```text
FROM: Codex Prompt Generator
TO: Implementacion
CHANGE_TYPE: [tipo]
OBJECTIVE: [objetivo concreto]
SCOPE: [archivos, modulos, documentos exactos]
SOURCE_DOCS: [documentos citados]
RESTRICTIONS: [lista de restricciones del producto]
ACCEPTANCE_CRITERIA: [criterios verificables]
P1_INCORPORATED: [P1 resueltos en el prompt]
POST_VALIDATION: [validaciones posteriores requeridas]
```

### Formato de output final del orquestador

```text
CHANGE_TYPE: [tipo]
AGENTS_ACTIVATED: [lista en orden de ejecucion]
DECISION: [APPROVED | BLOCKED | NEEDS_REVISION]
SEVERITIES: [P0/P1/P2 encontradas, o "ninguna"]
REASONS: [razones de la decision]
SOURCE_DOCS: [documentos consultados]
PROMPT: [prompt generado, si aplica]
NEXT_STEP: [implementar | corregir P1 | bloquear | re-auditar]
```

## Reglas criticas del flujo

Ningun paso puede permitir:

- derivar hacia curso
- introducir contenido explicativo largo
- agregar navegacion por modulos teoricos
- introducir usuarios con datos personas
- introducir tutor humano o virtual
- usar contenido oficial
- prometer aprobacion o resultado
