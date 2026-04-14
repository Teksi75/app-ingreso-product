# Agents Map - App Ingreso

## Proposito

Este mapa define la arquitectura simplificada de agentes para mantener App Ingreso alineado con su documentacion de producto.

El sistema se reduce a 4 agentes:

1. Product Guardian
2. Scope & Rules Validator
3. Quality Auditor
4. Codex Prompt Generator

La reduccion elimina redundancias sin perder control: el Product Guardian opera siempre y decide si necesita validaciones adicionales.

## Orquestacion del sistema

El flujo obligatorio entre agentes esta definido en `agents/orchestrator.md`.

Ningun cambio puede ejecutarse fuera de ese flujo: todo input debe pasar por clasificacion, validaciones aplicables y generacion de prompt antes de producir output.

## Principios protegidos

Ningun agente debe permitir que el sistema derive hacia:

- curso
- academia
- clases
- tutor humano o virtual
- contenido educativo tradicional
- contenido explicativo largo
- navegacion por modulos teoricos
- usuarios tradicionales con datos personales
- contenido oficial o afiliado
- promesas de aprobacion o resultado

El producto debe mantenerse como:

- entrenamiento autonomo
- practica intensiva
- habilidades medibles
- feedback inmediato y breve
- simulaciones sin ayuda
- metricas por habilidad
- acceso simple, idealmente por codigo
- minima o nula recoleccion de datos personales

## Agentes

### 1. Product Guardian

Archivo: `definitions/agent_01_product_guardian.md`

Rol:

- Orquestador central.
- Siempre se ejecuta.
- Clasifica cada cambio con `CHANGE_TYPE`.
- Decide que agentes se activan.
- Puede operar solo en ajustes menores.

Responsabilidades:

- Validar coherencia inicial contra vision y README.
- Clasificar cambios como:
  - idea nueva
  - ajuste menor
  - cambio estructural
  - cambio sobre codigo existente
- Detectar si el cambio requiere reglas, auditoria de calidad o prompt para Codex.

Se activa:

- siempre

### 2. Scope & Rules Validator

Archivo: `definitions/agent_02_scope_rules_validator.md`

Rol:

- Validador persistente consolidado.
- Reemplaza validaciones de alcance, legal, negocio, pedagogia, arquitectura y trazabilidad.

Responsabilidades:

- Validar coherencia con vision del producto.
- Validar reglas de negocio.
- Validar limites legales.
- Validar modelo pedagogico.
- Validar restricciones tecnicas.
- Validar trazabilidad documental.
- Emitir severidad `P0`, `P1` o `P2`.

Se activa si:

- hay nueva feature
- hay cambio de flujo
- hay nueva pantalla
- hay modificacion de acceso
- hay duda sobre reglas
- hay cambio estructural
- hay riesgo de curso, tutor, contenido largo, usuarios tradicionales o datos personales

### 3. Quality Auditor

Archivo: `definitions/agent_03_quality_auditor.md`

Rol:

- Auditor bajo demanda de calidad funcional.
- Reemplaza validaciones de habilidades, ejercicios, simulador, metricas y flujo de usuario.

Responsabilidades:

- Validar features implementadas.
- Detectar regresiones.
- Asegurar coherencia funcional.
- Validar explicitamente el loop:

`Pregunta -> Respuesta -> Feedback -> Ajuste -> Siguiente`

Se activa si:

- se modifica codigo existente
- se altera logica del sistema
- se cambia simulador
- se afectan metricas
- se cambia el motor de ejercicios
- se cambia feedback, adaptatividad o seleccion del siguiente ejercicio

### 4. Codex Prompt Generator

Archivo: `definitions/agent_04_codex_prompt_generator.md`

Rol:

- Agente temporal para generar prompts de implementacion.
- No toma decisiones de producto.

Responsabilidades:

- Convertir decisiones aprobadas en prompts acotados.
- Incluir restricciones del producto.
- Incluir criterios de aceptacion.
- Indicar archivos y validaciones posteriores.

Se activa si:

- el cambio esta clasificado
- no hay bloqueo `P0`
- las correcciones `P1` necesarias ya fueron resueltas o incorporadas al prompt
- existe una tarea concreta para Codex

## Relacion entre agentes

```text
Product Guardian
  -> decide si activa Scope & Rules Validator
  -> decide si activa Quality Auditor
  -> habilita Codex Prompt Generator cuando corresponde

Scope & Rules Validator
  -> bloquea o condiciona cambios por reglas, alcance, legal, negocio, pedagogia, arquitectura o trazabilidad
  -> entrega restricciones al Codex Prompt Generator

Quality Auditor
  -> revisa coherencia funcional y regresiones
  -> entrega hallazgos al Codex Prompt Generator si hace falta corregir

Codex Prompt Generator
  -> genera prompts ejecutables
  -> no define producto ni cambia reglas

Generacion de ejercicios
  -> despues de Codex Prompt Generator, Quality Auditor ejecuta validacion sobre ejercicios
  -> ningun set de ejercicios queda valido sin auditoria documentada
```

## Fuentes de verdad

Los agentes deben validar contra:

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

## Severidades

- `P0`: bloquea.
- `P1`: corregir antes de implementar.
- `P2`: mejora no bloqueante.

## Criterio de cierre

Un cambio puede avanzar a implementacion solo si:

- Product Guardian lo clasifico.
- Scope & Rules Validator no emitio `P0`, cuando fue activado.
- Los `P1` aplicables estan corregidos o incorporados como tarea explicita.
- Quality Auditor no detecto regresion bloqueante, cuando fue activado.
- Codex Prompt Generator recibio suficiente contexto para producir una tarea acotada.
