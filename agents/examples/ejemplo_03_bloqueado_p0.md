# Ejemplo 3 - Cambio bloqueado (P0)

## Solicitud de entrada

```
INPUT:
  solicitud: "Agregar un modulo de lecciones explicativas donde los estudiantes puedan estudiar la teoria de cada tema antes de practicar, con videos cortos y resumenes."
  area_afectada: vision, pedagogia, flujo
  documentos_relacionados: docs/00_vision/product_vision.md, docs/02_pedagogical_model/learning_model.md, docs/05_user_flow/user_journey.md
  toca_codigo_existente: no
  tipo_estimado: idea nueva
```

## Ejecucion del flujo

### Gate 1 - Product Guardian

```
CHANGE_TYPE: idea nueva
ACTIVATE_SCOPE_RULES: si
ACTIVATE_QUALITY_AUDIT: no (aun no hay codigo ni comportamiento que auditar)
REASONS: Propone una feature nueva (modulo de lecciones) que afecta vision, modelo pedagogico y flujo de usuario. Requiere validacion de alcance y reglas.
SOURCE_DOCS: docs/00_vision/product_vision.md, docs/02_pedagogical_model/learning_model.md
NEXT_GATE: 2 (Scope & Rules Validator)
```

### Gate 2 - Scope & Rules Validator

```
GATE: 2 - Scope & Rules
SEVERITY: P0
DECISION: BLOCKED
AFFECTED_RULES: vision, pedagogia, flujo
P0_BLOCKERS:
  1. Deriva hacia contenido explicativo largo como experiencia principal - contradice el principio central de que el aprendizaje ocurre por practica, no por explicacion
  2. Introduce navegacion por modulos teoricos (lecciones por tema) - prohibido explicitamente como estructura principal
  3. Introduce contenido tipo clase/leccion que convierte el producto en curso o academia - contradice la posicion de producto
P1_CORRECTIONS: no aplica (bloqueado por P0)
P2_NOTES: no aplica (bloqueado por P0)
CONSULTED_DOCS: docs/00_vision/product_vision.md, docs/02_pedagogical_model/learning_model.md, docs/05_user_flow/user_journey.md, docs/08_business_rules/business_rules.md
UNBLOCK_CONDITIONS:
  - Redisenar completamente la propuesta para que sea practica guiada por feedback (no lecciones con teoria)
  - Eliminar el modulo de lecciones y reemplazarlo por ejercicios con feedback breve que refuercen la practica
  - Eliminar la navegacion por temas teoricos y mantener la navegacion por habilidades entrenables
NEXT_GATE: BLOCKED
```

### Gate 3 - Quality Auditor

No se ejecuta. El flujo se detuvo en Gate 2 por P0.

### Gate 4 - Codex Prompt Generator

No se ejecuta. El flujo se detuvo en Gate 2 por P0.

## Output final del orquestador

```
CHANGE_TYPE: idea nueva
AGENTS_ACTIVATED: Product Guardian, Scope & Rules Validator
DECISION: BLOCKED
SEVERITIES: P0 x3
REASONS: La propuesta introduce un modulo de lecciones explicativas que contradice el principio central del producto (aprendizaje por practica, no por explicacion). Prohibido explicitamente: navegacion por modulos teoricos, contenido explicativo largo como experiencia principal, conversion hacia curso/academia.
SOURCE_DOCS: docs/00_vision/product_vision.md, docs/02_pedagogical_model/learning_model.md, docs/05_user_flow/user_journey.md
NEXT_STEP: bloqueado. Redisenar como sistema de practica con feedback breve, sin lecciones explicativas ni modulos teoricos.
```

## Alternativa sugerida

Si el objetivo es que los estudiantes refuercen conocimiento antes de practicar, la alternativa alineada con el producto seria:

- Agregar ejercicios de precalentamiento (warm-up) que activen la habilidad sin explicar teoria.
- El feedback breve de cada ejercicio ya cumple la funcion de orientacion, sin necesidad de lecciones.
- El simulador combina habilidades bajo presion de tiempo, lo que es mejor preparacion que leer una leccion.