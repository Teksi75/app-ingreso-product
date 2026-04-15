# Ejemplo 2 - Idea nueva (flujo completo)

## Solicitud de entrada

```
INPUT:
  solicitud: "Agregar un sistema de streaks (racha de dias consecutivos de practica) para motivar la constancia del estudiante."
  area_afectada: metricas, flujo
  documentos_relacionados: docs/07_metrics/progress_metrics.md, docs/05_user_flow/user_journey.md
  toca_codigo_existente: no
  tipo_estimado: idea nueva
```

## Ejecucion del flujo

### Gate 1 - Product Guardian

```
CHANGE_TYPE: idea nueva
ACTIVATE_SCOPE_RULES: si
ACTIVATE_QUALITY_AUDIT: si
REASONS: Propone una feature nueva que afecta metricas, flujo de usuario y posiblemente el modelo de motivacion. Es una idea nueva que requiere validacion de alcance, reglas y calidad funcional.
SOURCE_DOCS: docs/07_metrics/progress_metrics.md, docs/05_user_flow/user_journey.md, docs/00_vision/product_vision.md
NEXT_GATE: 2 (Scope & Rules Validator)
```

### Gate 2 - Scope & Rules Validator

```
GATE: 2 - Scope & Rules
SEVERITY: P1
DECISION: NEEDS_REVISION
AFFECTED_RULES: pedagogia, metricas
P0_BLOCKERS: ninguno
P1_CORRECTIONS:
  1. Definir si el streak es por habilidad o general (documentar en skills_map.md o progress_metrics.md)
  2. Asegurar que el streak no se presente como garantia de resultado ni aprobacion
  3. Evitar que el streak cree dependencia o ansiedad en menores de 11-12 anos
  4. Documentar como se calcula el streak y que datos se almacenan (revisar contra legal_positioning.md)
P2_NOTES:
  - Considerar si el streak deberia tener un reseteo suave (no penalizar 1 dia de ausencia)
CONSULTED_DOCS: docs/00_vision/product_vision.md, docs/07_metrics/progress_metrics.md, docs/05_user_flow/user_journey.md, docs/09_legal_positioning/legal_positioning.md, docs/02_pedagogical_model/learning_model.md
UNBLOCK_CONDITIONS: no aplica (no hay P0)
NEXT_GATE: 3 (Quality Auditor)
```

### Gate 3 - Quality Auditor

```
GATE: 3 - Quality
AUDIT_RESULT: PASS_WITH_NOTES
SEVERITY: P2
REGRESSIONS: ninguna
LOOP_IMPACT: El streak no afecta directamente el loop Pregunta->Respuesta->Feedback->Ajuste->Siguiente, pero puede influir en la motivacion para regresar al loop.
P0_BLOCKERS: ninguno
P1_CORRECTIONS: ninguna
P2_NOTES:
  - El streak deberia mostrarse DESPUES de completar una sesion de practica, no como pantalla de inicio que retrase el acceso al loop
  - Verificar que el streak no reemplace la metrica de habilidad como indicador principal
RE_AUDIT_REQUIRED: si (se generaran nuevas pantallas y componentes)
NEXT_GATE: 4
```

### Gate 4 - Codex Prompt Generator

```
CODEX_PROMPT:
---

**Objetivo**: Agregar un sistema de streaks (racha de dias consecutivos de practica) que motive la constancia sin crear ansiedad ni reemplazar las metricas de habilidad.

**Alcance**:
- Archivos: [nuevos componentes de streak segun arquitectura], docs/07_metrics/progress_metrics.md, docs/05_user_flow/user_journey.md
- Modulos: metricas, flujo de usuario
- Documentos a actualizar: progress_metrics.md, user_journey.md, skills_map.md (si el streak es por habilidad)

**Documentos citados**:
- docs/07_metrics/progress_metrics.md - define el sistema de metricas actual
- docs/05_user_flow/user_journey.md - define el flujo de usuario donde se integraria el streak
- docs/02_pedagogical_model/learning_model.md - define el modelo pedagogico que el streak debe respetar
- docs/09_legal_positioning/legal_positioning.md - revisar limits de datos y comunicacion con menores

**Restricciones**:
- No derivar hacia curso, tutor, contenido explicativo largo ni navegacion por modulos
- No introducir usuarios tradicionales con datos personales innecesarios
- No usar contenido oficial ni prometer resultados
- No ofrecer ayuda durante simulaciones
- El streak NO debe presentarse como garantia de aprobacion o resultado
- El streak NO debe crear dependencia ni ansiedad en menores
- El streak NO debe reemplazar la metrica de habilidad como indicador principal
- El streak debe mostrarse DESPUES de completar practica, no como pantalla que retrase el acceso

**Criterios de aceptacion**:
1. El streak cuenta dias consecutivos de practica sin penalizar 1 dia de ausencia (reseteo suave)
2. El streak se muestra como indicador secundario, no como metrica principal
3. El streak no promete resultado ni aprobacion
4. No se almacenan datos personales adicionales para calcular el streak
5. El calculo del streak esta documentado en progress_metrics.md
6. El flujo no agrega pantallas que retrase el acceso al loop de practica
7. La vista del adulto responsable muestra constancia sin transformarse en tutoria

**P1 incorporados**:
1. Definir si el streak es por habilidad o general (documentar en progress_metrics.md)
2. Asegurar que el streak no se presenta como garantia de resultado ni aprobacion
3. Evitar que el streak cree dependencia o ansiedad en menores
4. Documentar como se calcula el streak y que datos se almacenan

**Validaciones posteriores**:
- Re-auditar con Quality Auditor despues de implementar los componentes de UI
- Verificar que el streak no aparece antes del loop de practica en el flujo
- Revisar que no se almacenan datos personales adicionales

---
```

## Output final del orquestador

```
CHANGE_TYPE: idea nueva
AGENTS_ACTIVATED: Product Guardian, Scope & Rules Validator, Quality Auditor, Codex Prompt Generator
DECISION: APPROVED_WITH_NOTES
SEVERITIES: P1 x4 (corregidas e incorporadas al prompt), P2 x2 (observaciones no bloqueantes)
REASONS: Feature alineada con motivacion de constancia. Requirio correcciones P1 sobre definicion, presentacion, impacto en menores y datos. Las P1 estan incorporadas como tareas obligatorias en el prompt.
SOURCE_DOCS: docs/00_vision/product_vision.md, docs/07_metrics/progress_metrics.md, docs/05_user_flow/user_journey.md, docs/09_legal_positioning/legal_positioning.md, docs/02_pedagogical_model/learning_model.md
NEXT_STEP: implementar y luego re-auditar con Quality Auditor
```