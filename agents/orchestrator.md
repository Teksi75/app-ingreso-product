# Agent Orchestrator

## Proposito

Definir el sistema obligatorio de orquestacion para que Codex ejecute la secuencia de agentes sin intervencion manual externa.

Este archivo controla el orden de decision antes de cualquier implementacion, edicion o generacion de prompt.

## Flujo obligatorio

Todo cambio debe seguir este flujo:

```text
INPUT
  -> Product Guardian
  -> Scope & Rules Validator, si aplica
  -> Quality Auditor, si aplica
  -> Codex Prompt Generator
  -> Generacion de ejercicios, si aplica
  -> Quality Auditor, si se generaron ejercicios
  -> OUTPUT validado
```

No existe salida directa desde `INPUT` hacia implementacion.

## Agentes del flujo

### Product Guardian

Se ejecuta siempre.

Responsabilidades:

- clasificar el cambio antes de actuar
- emitir `CHANGE_TYPE`
- decidir si corresponde activar Scope & Rules Validator
- decidir si corresponde activar Quality Auditor
- bloquear cambios incompatibles con el producto
- habilitar Codex Prompt Generator solo si el cambio puede avanzar

Codex no puede generar codigo, editar documentos ni producir prompts de implementacion sin pasar antes por Product Guardian.

### Scope & Rules Validator

Se ejecuta si el cambio afecta alcance, reglas, flujo, acceso, negocio, posicionamiento legal, modelo pedagogico, arquitectura, trazabilidad documental o cualquier riesgo de desvio del producto.

Debe activarse si el cambio incluye:

- nueva feature
- cambio de flujo
- nueva pantalla
- modificacion de acceso
- cambio estructural
- duda sobre reglas
- riesgo legal, comercial, pedagogico, tecnico o documental
- riesgo de curso, tutor, contenido largo, usuarios tradicionales, datos personales o contenido oficial

No puede saltearse si el tipo de cambio lo requiere.

### Quality Auditor

Se ejecuta si el cambio afecta codigo existente, logica funcional, simulador, metricas, motor de ejercicios, feedback, adaptatividad, seleccion de siguiente ejercicio o riesgo de regresion.

Tambien se ejecuta despues de generar un set de ejercicios.

Debe validar el loop:

```text
Pregunta -> Respuesta -> Feedback -> Ajuste -> Siguiente
```

No puede saltearse si el cambio modifica comportamiento funcional o puede introducir regresiones.

### Codex Prompt Generator

Se ejecuta solo despues de la clasificacion y de las validaciones requeridas.

Responsabilidades:

- convertir una decision validada en prompt ejecutable
- mantener alcance acotado
- incluir restricciones del sistema
- citar documentos fuente
- incluir criterios de aceptacion
- incorporar correcciones `P1` obligatorias
- indicar validaciones posteriores

No toma decisiones de producto y no puede ampliar alcance.

Si el prompt genera ejercicios, el output debe volver a Quality Auditor antes de considerarse validado.

## Clasificacion obligatoria

Codex debe siempre clasificar el cambio antes de actuar.

Valores permitidos para `CHANGE_TYPE`:

- `idea nueva`
- `ajuste menor`
- `cambio estructural`
- `cambio sobre codigo existente`

Reglas:

- todo input debe recibir un `CHANGE_TYPE`
- ningun cambio puede avanzar sin clasificacion
- un ajuste menor puede avanzar solo con Product Guardian si no afecta reglas, flujo, codigo, logica ni documentos fuente criticos
- un cambio estructural debe pasar por Scope & Rules Validator
- un cambio sobre codigo existente debe pasar por Quality Auditor
- una idea nueva debe pasar por Scope & Rules Validator antes de convertirse en prompt

## Reglas de ejecucion

Codex debe ejecutar decisiones sin volver al usuario cuando el flujo tenga informacion suficiente.

Codex debe bloquear o condicionar el avance si:

- Product Guardian no clasifico el cambio
- Scope & Rules Validator era requerido y no se ejecuto
- Quality Auditor era requerido y no se ejecuto
- existe severidad `P0`
- existe severidad `P1` no corregida ni incorporada como tarea obligatoria
- el prompt no cita documentos fuente
- el prompt no incluye criterios de aceptacion
- el cambio contradice las restricciones obligatorias

Codex puede avanzar a Codex Prompt Generator solo si:

- Product Guardian clasifico el cambio
- no hay `P0`
- los `P1` aplicables estan corregidos o incorporados al prompt
- Scope & Rules Validator se ejecuto cuando correspondia
- Quality Auditor se ejecuto cuando correspondia

Codex puede producir `OUTPUT` solo si:

- el flujo obligatorio fue respetado
- las validaciones requeridas fueron ejecutadas
- todo set de ejercicios tiene auditoria documentada
- la decision final esta expresada en el formato estandar
- no hay prompt directo sin validacion previa

## Formato de salida estandar

Toda decision del orquestador debe usar este formato:

```text
CHANGE_TYPE:
AGENTS_ACTIVATED:
DECISION:
NEXT_STEP:
```

Campos:

- `CHANGE_TYPE`: clasificacion emitida por Product Guardian
- `AGENTS_ACTIVATED`: lista de agentes ejecutados en orden
- `DECISION`: aprobar, bloquear, pedir correccion obligatoria o generar prompt
- `NEXT_STEP`: accion concreta que Codex debe ejecutar

## Integracion con prompts

Todo prompt generado por Codex Prompt Generator debe incluir:

- objetivo concreto
- alcance exacto
- archivos permitidos o esperados
- restricciones del sistema
- documentos citados
- criterios de aceptacion
- validaciones posteriores
- hallazgos `P1` incorporados como tareas obligatorias, si existen

Documentos fuente que deben citarse cuando apliquen:

- `README.md`
- `docs/00_vision/product_vision.md`
- `docs/08_business_rules/business_rules.md`
- `docs/09_legal_positioning/legal_positioning.md`
- `docs/02_pedagogical_model/learning_model.md`
- `docs/03_skill_system/skills_map.md`
- `docs/04_exercise_engine/exercise_engine_v1.md`
- `docs/05_user_flow/user_journey.md`
- `docs/06_simulator/simulator_model.md`
- `docs/07_metrics/progress_metrics.md`
- `docs/analysis/PRODUCT_ANALYSIS.md`
- `decisions/*.md`
- `roadmap/roadmap.md`

## Restricciones obligatorias

Ningun agente, prompt o salida puede derivar hacia:

- curso
- tutor
- contenido explicativo largo
- navegacion por modulos
- contenido oficial

Tambien quedan bloqueados:

- clases
- academia
- contenido educativo tradicional
- usuarios tradicionales con datos personales
- promesas de aprobacion o resultado
- afiliacion institucional no documentada
- ayuda durante la resolucion de simulaciones

## Criterios de aceptacion del orquestador

El orquestador se considera valido si:

- Codex puede ejecutar decisiones sin volver al usuario cuando haya contexto suficiente
- cada tarea sigue el flujo de agentes
- Product Guardian se ejecuta siempre
- Scope & Rules Validator se ejecuta cuando el cambio lo requiere
- Quality Auditor se ejecuta cuando el cambio lo requiere
- Codex Prompt Generator no recibe tareas sin validacion previa
- no hay prompts directos sin clasificacion
- todo prompt incluye restricciones, documentos citados y criterios de aceptacion
- las restricciones obligatorias bloquean cualquier cambio incompatible

## Regla final

Si existe duda sobre si una validacion aplica, Codex debe activar la validacion.

No se permite asumir que una validacion puede omitirse cuando el cambio tiene impacto en producto, reglas, flujo, codigo, calidad, metricas, simulador, feedback, adaptatividad o trazabilidad documental.
