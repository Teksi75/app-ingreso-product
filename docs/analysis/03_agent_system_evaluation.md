# 03 — Evaluación del Sistema de Agentes

> Auditoría sistémica global · Fase 3

---

## 1. Identificación Global

### Archivos de agentes detectados

```
agents/
├── agents_map.md                    ← Mapa de los 4 agentes + relaciones
├── orchestrator.md                  ← Flujo obligatorio de orquestación (228 líneas)
├── orchestrator_prompt.md           ← Prompt maestro para copiar/pegar en LLM (161 líneas)
├── definitions/
│   ├── agent_01_product_guardian.md      ← 133 líneas
│   ├── agent_02_scope_rules_validator.md ← 171 líneas
│   ├── agent_03_quality_auditor.md       ← 136 líneas
│   └── agent_04_codex_prompt_generator.md ← 79 líneas
├── protocols/
│   ├── interaction_flow.md          ← Formatos de comunicación entre agentes (287 líneas)
│   └── validation_pipeline.md       ← Pipeline de validación
├── prompts/
│   ├── product_guardian.md          ← System prompt para Product Guardian
│   ├── scope_rules_validator.md     ← System prompt para Scope & Rules Validator
│   ├── quality_auditor.md           ← System prompt para Quality Auditor
│   └── codex_prompt_generator.md    ← System prompt para Codex Prompt Generator
└── examples/
    ├── ejemplo_01_ajuste_menor.md   ← Ejemplo de flujo: ajuste menor
    ├── ejemplo_02_idea_nueva.md     ← Ejemplo de flujo: idea nueva
    └── ejemplo_03_bloqueado_p0.md   ← Ejemplo de flujo: bloqueo P0
```

**Total**: 16 archivos, ~1,500+ líneas de documentación de agentes.

### Contenido adicional que referencia agentes

- `AGENTS.md` — instrucciones de graphify y contexto para opencode
- `docs/00_vision/product_vision.md` — menciona "La implementación del producto está mediada por un sistema de agentes"
- `docs/analysis/PRODUCT_ANALYSIS.md` — análisis del producto que los agentes deberían proteger
- `decisions/ADR-001-product-scope.md` — decisiones que los agentes validan

---

## 2. Evaluación como Sistema

### ¿Los agentes forman un sistema real?

**No.** Los agentes son un sistema documental diseñado para ser ejecutado por un LLM humano-operado.

### Evidencia

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Definiciones formales | ✅ Completas | 4 agentes con roles, inputs, outputs, reglas de activación |
| Prompts operativos | ✅ Completos | System prompts en `agents/prompts/` |
| Protocolo de comunicación | ✅ Completo | Formatos de mensaje en `agents/protocols/interaction_flow.md` |
| Ejemplos de uso | ✅ Completos | 3 escenarios en `agents/examples/` |
| Código ejecutable | ❌ Ausente | No hay TypeScript/JavaScript que implemente agentes |
| Integración en runtime | ❌ Ausente | Ningún componente de la app invoca agentes |
| Orquestación automática | ❌ Ausente | `orchestrator.md` es una descripción, no un motor |
| Toma de decisiones autónoma | ❌ Ausente | Los agentes no analizan código automáticamente |

### Naturaleza real del sistema agentico

El sistema de agentes es un **protocolo documental para uso humano con LLM**:

1. El usuario copia el contenido de `orchestrator_prompt.md`
2. Lo pega al inicio de una sesión con Cursor, Claude, ChatGPT, etc.
3. El LLM "interpreta" el flujo de agentes
4. El LLM simula ejecutar Product Guardian, Scope & Rules Validator, etc.
5. El LLM genera el output en el formato estandarizado

**No hay ejecución programática.** No hay API. No hay hooks. No hay middleware.

---

## 3. Flujo Agentico

### Flujo documentado

```
INPUT (solicitud del usuario)
  → Product Guardian (clasifica CHANGE_TYPE)
  → Scope & Rules Validator (si aplica)
  → Quality Auditor (si aplica)
  → Codex Prompt Generator
  → OUTPUT (prompt validado)
```

### Flujo real (en el código)

```
No existe.
```

### Decisiones automatizadas

| Decisión | ¿Automatizada? | ¿Dónde? |
|----------|---------------|---------|
| Clasificar tipo de cambio | No | El LLM interpreta la descripción |
| Activar validadores | No | El LLM decide basándose en el prompt |
| Validar contra visión | No | El LLM lee los documentos markdown |
| Validar contra reglas de negocio | No | El LLM lee los documentos markdown |
| Detectar regresiones | No | El LLM "analiza" diffs de código |
| Generar prompt validado | No | El LLM escribe el prompt |

### Encadenamiento de agentes

No existe encadenamiento programático. El "flujo" es una secuencia de roles que el LLM asume secuencialmente dentro de una misma conversación.

---

## 4. Clasificación

### Clasificación: DOCUMENTAL

### Justificación

```
Niveles de integración:

❌ INEXISTENTE     → no hay ni documentación
❌ PARCIALMENTE    → hay código parcial pero no funcional
❌ OPERATIVO       → agentes ejecutan automáticamente en runtime
✅ DOCUMENTAL      → agentes existen como especificación para uso humano
```

El sistema de agentes está **completamente documentado** pero **completamente desacoplado** del sistema en ejecución. Es una guía de operación para el desarrollador, no un sistema operativo del código.

### Métricas

| Dimensión | Valor |
|-----------|-------|
| Archivos de documentación | 16 |
| Líneas de especificación | ~1,500 |
| Líneas de código agentico | 0 |
| Integraciones con runtime | 0 |
| Agentes ejecutables | 0 de 4 |
| Decisiones automatizadas | 0 |

---

## 5. Brecha Crítica

### ¿Qué falta para que los agentes gobiernen el sistema real?

#### Nivel 1: Ejecución programática

Los agentes necesitan ser funciones TypeScript que:
- Reciben input (código, diffs, propuestas de cambio)
- Producen output estructurado (clasificación, severidad, decisiones)
- Se pueden encadenar programáticamente

```
HOY:  LLM lee prompt → interpreta → decide
DEBE: función ejecuta → analiza datos → retorna decisión estructurada
```

#### Nivel 2: Integración en el pipeline de desarrollo

Los agentes deberían ejecutarse automáticamente:
- En pre-commit hooks (validar cambios antes de commitear)
- En CI/CD (validar PRs antes de mergear)
- En el runtime de desarrollo (validar código al guardar)

```
HOY:  Ningún hook, ningún pipeline, ningún middleware
DEBE: git hook → agent pipeline → resultado → approve/block
```

#### Nivel 3: Acceso a datos del sistema

Los agentes necesitan acceso programático a:
- El código fuente (AST, diffs, imports)
- Los documentos de producto (parseados, no como texto libre)
- El grafo de skills y relaciones
- El historial de progreso
- Las decisiones previas (ADRs)

```
HOY:  Los agentes "leen" documentos como texto libre (el LLM los interpreta)
DEBE: funciones acceden a datos estructurados del sistema
```

#### Nivel 4: Motor de reglas ejecutable

Las reglas de los agentes (cuándo activar, qué validar, severidades) necesitan ser un motor de reglas ejecutable:

```
HOY:  "Si el cambio es idea nueva → activar Scope & Rules Validator"
      (texto interpretado por LLM)

DEBE: if (changeType === "idea_nueva") { activate(scopeRulesValidator) }
      (código ejecutable)
```

#### Nivel 5: Output integrado

El output de los agentes debe integrarse en el flujo de desarrollo:
- No como texto para que el humano lea
- Sino como datos que el sistema consume (approve/block, restricciones, criterios)

### Resumen de la brecha

```
Sistema actual:    100% documental, 0% ejecutable
Sistema necesario: ~30% documental (mantener especificaciones), ~70% ejecutable

Componentes faltantes:
1. Parser de código fuente (AST analysis)
2. Motor de reglas (condition → action)
3. Pipeline executor (encadenar agentes)
4. Git hooks integration
5. Structured output contracts (no texto libre)
6. Data access layer (leer JSON, código, documentos)
```
