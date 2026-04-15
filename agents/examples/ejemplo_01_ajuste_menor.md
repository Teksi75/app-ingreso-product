# Ejemplo 1 - Ajuste menor (FAST PATH)

## Solicitud de entrada

```
INPUT:
  solicitud: "Corregir la redaccion del parrafo de introduccion en product_vision.md. Actualmente dice 'los estudiantes podran aprender' y deberia decir 'los estudiantes podran practicar'."
  area_afectada: vision
  documentos_relacionados: docs/00_vision/product_vision.md
  toca_codigo_existente: no
  tipo_estimado: ajuste menor
```

## Ejecucion del flujo

### Gate 1 - Product Guardian

```
CHANGE_TYPE: ajuste menor
ACTIVATE_SCOPE_RULES: no
ACTIVATE_QUALITY_AUDIT: no
REASONS: Cambio de redaccion puntual. No modifica reglas, flujo, arquitectura, codigo ni comportamiento. El cambio refuerza el principio de practica sobre explicacion.
SOURCE_DOCS: docs/00_vision/product_vision.md
NEXT_GATE: 4 (Codex Prompt Generator)
```

### Gate 2 - Scope & Rules Validator

No se activa. El cambio es un ajuste menor sin impacto en reglas, alcance ni riesgos.

### Gate 3 - Quality Auditor

No se activa. No modifica codigo existente ni logica funcional.

### Gate 4 - Codex Prompt Generator

```
CODEX_PROMPT:
---

**Objetivo**: Corregir la palabra "aprender" por "practicar" en el parrafo de introduccion de product_vision.md.

**Alcance**:
- Archivos: docs/00_vision/product_vision.md
- Modulos: ninguno (solo documentacion)
- Documentos a actualizar: docs/00_vision/product_vision.md

**Documentos citados**:
- docs/00_vision/product_vision.md - contiene el parrafo a corregir

**Restricciones**:
- No agregar contenido explicativo largo
- No cambiar el significado del parrafo, solo la terminologia
- Mantener "practicar" alineado con el principio de entrenamiento por habilidades

**Criterios de aceptacion**:
1. El parrafo de introduccion dice "practicar" en lugar de "aprender"
2. No se agrego contenido nuevo al documento
3. El resto del documento permanece sin cambios

**P1 incorporados**: ninguno

**Validaciones posteriores**:
- Verificar que product_vision.md no contiene inconsistencias terminologicas adicionales

---
```

## Output final del orquestador

```
CHANGE_TYPE: ajuste menor
AGENTS_ACTIVATED: Product Guardian, Codex Prompt Generator
DECISION: APPROVED
SEVERITIES: ninguna
REASONS: Cambio de redaccion que refuerza el principio de practica. Sin impacto en reglas, codigo ni comportamiento.
SOURCE_DOCS: docs/00_vision/product_vision.md
NEXT_STEP: implementar
```