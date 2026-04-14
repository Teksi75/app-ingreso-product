# Validation Pipeline - Sistema Simplificado de Agentes

## Proposito

Este pipeline define como se valida una idea, prompt, documento o implementacion dentro de la arquitectura de 4 agentes.

## Pipeline resumido

```text
Entrada
  -> Product Guardian
  -> Scope & Rules Validator, si aplica
  -> Quality Auditor, si aplica
  -> Codex Prompt Generator
  -> Implementacion
Salida
```

## Gate 1 - Clasificacion

### Agente responsable

Product Guardian

### Objetivo

Determinar el tipo de cambio y decidir si alcanza con Product Guardian o si se requieren validadores adicionales.

### CHANGE_TYPE

- `idea nueva`
- `ajuste menor`
- `cambio estructural`
- `cambio sobre codigo existente`

### Preguntas

- Es una feature nueva?
- Es un cambio menor sin impacto funcional?
- Cambia reglas, acceso, flujo, legal, negocio, pedagogia, arquitectura o documentacion estructural?
- Modifica codigo existente o logica ya implementada?
- Puede derivar hacia curso, tutor, contenido largo, usuarios tradicionales o datos personales?

### Salidas

- activar Scope & Rules Validator
- activar Quality Auditor
- pasar a Codex Prompt Generator
- bloquear si el cambio contradice el producto de forma evidente

## Gate 2 - Scope & Rules

### Agente responsable

Scope & Rules Validator

### Se activa si

- nueva feature
- cambio de flujo
- nueva pantalla
- modificacion de acceso
- duda sobre reglas
- cambio estructural
- riesgo legal, comercial, pedagogico, tecnico o de trazabilidad

### Valida

- vision del producto
- reglas de negocio
- limites legales
- modelo pedagogico
- restricciones tecnicas
- trazabilidad documental

### Bloqueos tipicos

- curso, clase, tutor o ensenanza explicita como nucleo
- contenido explicativo largo
- navegacion por modulos teoricos
- usuarios tradicionales con datos personales
- contenido oficial o afiliacion institucional
- promesa de aprobacion o resultado
- implementacion sin documento fuente
- arquitectura que impide auditar metricas, ejercicios o reglas

## Gate 3 - Quality

### Agente responsable

Quality Auditor

### Se activa si

- se modifica codigo existente
- se altera logica del sistema
- se cambia simulador
- se afectan metricas
- se cambia motor de ejercicios
- se cambia feedback o adaptatividad
- se requiere detectar regresiones

### Valida explicitamente

`Pregunta -> Respuesta -> Feedback -> Ajuste -> Siguiente`

### Tambien valida

- mapeo ejercicio -> habilidad -> metrica
- respuesta unica y verificable
- distractores plausibles
- feedback inmediato, breve y accionable
- simulador sin ayuda durante resolucion
- metricas simples por habilidad
- acceso y flujo de baja friccion
- ausencia de regresiones funcionales

## Gate 4 - Prompt

### Agente responsable

Codex Prompt Generator

### Objetivo

Convertir una decision validada en tarea ejecutable para Codex.

### Debe incluir

- objetivo concreto
- archivos a tocar
- documentos fuente
- restricciones del producto
- criterios de aceptacion
- correcciones `P1`, si existen
- validaciones posteriores

### No puede

- tomar decisiones de producto
- inventar reglas
- ampliar alcance sin autorizacion del Product Guardian
- omitir restricciones emitidas por Scope & Rules Validator o Quality Auditor

## Severidades

### P0 -> bloquea

El cambio no puede avanzar a prompt ni implementacion.

Usar P0 si:

- deriva hacia curso, clase, tutor o ensenanza explicita como nucleo
- introduce contenido explicativo largo como experiencia principal
- agrega navegacion por modulos teoricos
- introduce usuarios tradicionales con datos personales
- usa o imita contenido oficial
- promete aprobacion, resultado o equivalencia con examen real
- requiere intervencion humana en el flujo de aprendizaje
- rompe el loop central de practica
- no tiene trazabilidad documental para un cambio estructural

### P1 -> corregir antes de implementar

El cambio puede ser valido, pero necesita correccion obligatoria antes de implementarse.

Usar P1 si:

- falta criterio de aceptacion
- hay contradiccion documental
- falta actualizar un `.md` fuente
- una metrica o regla de adaptatividad no esta definida
- el feedback es demasiado largo o teorico
- el acceso pide mas datos de los necesarios
- el simulador incluye ayuda o feedback durante resolucion
- la arquitectura mezcla responsabilidades criticas
- una feature toca logica existente sin plan de regresion

### P2 -> mejora

El cambio puede avanzar con observaciones documentadas.

Usar P2 si:

- hay redaccion mejorable
- faltan ejemplos secundarios
- hay deuda documental menor
- hay mejora no critica de auditabilidad
- falta precision en dificultad o copy, pero no afecta el comportamiento actual

## Reglas de avance

### Puede avanzar a Codex Prompt Generator si

- Product Guardian clasifico el cambio.
- No hay `P0`.
- Los `P1` estan corregidos o incorporados como tarea obligatoria.
- Quality Auditor fue activado cuando habia riesgo funcional.

### Puede avanzar a implementacion si

- el prompt esta acotado
- los archivos a tocar estan claros
- las restricciones criticas estan incluidas
- hay criterios de aceptacion verificables

### No puede cerrarse si

- queda una referencia a agentes eliminados
- hay contradiccion no registrada
- los docs quedan desactualizados
- no se puede explicar por que el cambio respeta el producto
