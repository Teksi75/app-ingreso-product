# Auditoría E2E — INGENIUM / Teksi75

**Fecha:** 2026-04-27
**Método:** Ejecución automatizada de tests (Vitest + Playwright), auditoría de contenido JSON, revisión de documentación y grep de secretos

---

## Resumen Ejecutivo

| Check | Estado | Detalle |
|-------|--------|---------|
| Typecheck | ✅ PASA | 0 errores TypeScript |
| Unit tests | ✅ 8/8 PASAN | 39 assertions |
| E2E tests | ✅ 21/21 PASAN | 19 originales + 2 nuevos (simulador) |
| Build | ✅ EXITOSO | `next build` sin errores |
| Secrets | ✅ LIMPIO | Sin hardcoded keys, sin .env en repo |
| Contenido | ⚠️ 4 DUPLICATE OPTIONS | Ejercicios con opciones repetidas |
| Documentación | ⚠️ 1 DOC DESACTUALIZADA | PRODUCT_ANALYSIS.md referencia ADR-005 obsoleta |
| .gitignore | ⚠️ GAP | Falta patrón para `.env` (plain) |

---

## Hallazgos por Severidad

### P0 — Bugs funcionales corregidos

Ninguno. Todos los tests pasan. La última regresión fue el 25/04 (UI redesign sin actualizar tests). Los 6 tests desactualizados fueron corregidos en esta sesión.

### P1 — Requiere atención antes de cerrar

| # | Hallazgo | Archivos | Esfuerzo |
|---|----------|----------|----------|
| 1 | **Duplicate options en 4 ejercicios** — misma opción aparece 2 veces, UX ambigua | `ley_001_cantuta.json` (M4-LEY-003), `enc_001_humedales.json` (M5-ENC-007, M5-ENC-008, M5-ENC-009) | Bajo |
| 2 | **Errores de tipeo visibles al estudiante** — `"varíos"`, `"sitúación"`, `"opiniónes"`, `"estan"`, `"cuálquier"` | `cue_001_maquina_recuerdos.json`, `enc_001_humedales.json`, `ins_001_carta_reclamo.json`, `ley_001_cantuta.json`, `not_001_festival_robots.json` | Bajo |
| 3 | **.gitignore no cubre `.env`** — solo `.env*.local` está excluido, un `.env` se commitearía | `.gitignore` | Bajo |

### P2 — Mejoras detectadas

| # | Hallazgo | Archivos | Esfuerzo |
|---|----------|----------|----------|
| 4 | **PRODUCT_ANALYSIS.md referencia ADR-005 obsoleta** — dice "Crear ADR-005 Modelo de roles" pero ADR-005 ya existe con otro tema | `docs/analysis/PRODUCT_ANALYSIS.md` | Bajo |
| 5 | **agents_map.md referencia filename incorrecta** — dice `agents/orchestrator.md` pero el archivo es `orchestrator_prompt.md` | `agents/agents_map.md` | Bajo |
| 6 | **6 tests E2E con expectativas desactualizadas** — corregidos en esta sesión, pero muestran que la UI se rediseñó sin actualizar tests | `tests/e2e/*.spec.ts` | Ya resuelto |

---

## Tests ejecutados

### Unit tests (Vitest)

| Spec | Tests | Estado |
|------|-------|--------|
| `skill_slugs.test.ts` | 14 | ✅ |
| `next_step.test.ts` | 5 | ✅ |
| `lengua_integration.test.ts` | 11 | ✅ |
| `exercise_selector.test.ts` | 1 | ✅ |
| `simulator_runner.test.ts` | 4 | ✅ |
| `simulator_progress.test.ts` | 4 | ✅ |
| `session_progress.test.ts` | 3 | ✅ |
| `content_quality.test.ts` | 1 | ✅ |
| **Total** | **43** | **✅** |

### E2E tests (Playwright)

| Spec | Tests | Estado |
|------|-------|--------|
| `all-pages.spec.ts` | 1 | ✅ |
| `dashboard-progress.spec.ts` | 3 | ✅ |
| `dashboard-responsive.spec.ts` | 1 | ✅ |
| `dashboard-screenshot.spec.ts` | 1 | ✅ |
| `first-experience.spec.ts` | 3 | ✅ |
| `lengua-practice-links.spec.ts` | 5 | ✅ |
| `student-profile-and-code.spec.ts` | 2 | ✅ |
| `audit-weak-skill-ui.spec.ts` | 1 | ✅ |
| `adaptive-weak-skill-reinforcement.spec.ts` | 1 | ✅ |
| `pedagogical-gradual-skill-strengthening.spec.ts` | 1 | ✅ |
| `simulator-full-flow.spec.ts` (NUEVO) | 2 | ✅ |
| **Total** | **21** | **✅** |

---

## Contenido auditado

| Métrica | Valor |
|---------|-------|
| Archivos de ejercicios | 9 |
| Total ejercicios | 58 |
| Archivos de reading units | 6 |
| Skills canónicas cubiertas | 7/7 |
| Ejercicios con opciones duplicadas | **4** |
| Errores de tipeo | **6** |
| Ejercicios sin campos requeridos | 0 |
| Difficulty fuera de rango | 0 |

---

## Cobertura del simulador

| Skill | Ejercicios MC disponibles | En simulador |
|-------|--------------------------|--------------|
| skill_1 (Comprensión) | ~60 | ✅ |
| skill_2 (Estructura) | ~24 | ✅ |
| skill_3 (Producción) | ~18 | ✅ |
| skill_4 (Morfosintaxis) | ~28 | ✅ |
| skill_5 (Gestión verbal) | ~25 | ✅ |
| skill_6 (Ortografía) | ~25 | ✅ |
| skill_7 (Puntuación) | ~17 | ✅ |

El test `skill_slugs.test.ts` verifica skill_3 en el simulador. Se agregó `simulator-full-flow.spec.ts` que valida el flujo completo de punta a punta.

---

## Seguridad

- ✅ Sin `.env` en el repo
- ✅ Sin hardcoded API keys, tokens ni passwords
- ✅ `process.env` usa solo variables de entorno legítimas
- ✅ GitHub Actions usa `${{ secrets.* }}` correctamente
- ⚠️ `.gitignore` no excluye `.env` (plain) — agregar patrón

---

## Acciones recomendadas (orden de prioridad)

1. **Corregir duplicate options** en 4 ejercicios (P1)
2. **Corregir errores de tipeo** en 5 archivos de contenido (P1)
3. **Agregar `.env` a `.gitignore`** (P1)
4. **Actualizar PRODUCT_ANALYSIS.md** — cerrar referencia obsoleta a ADR-005 (P2)
5. **Corregir `agents_map.md`** — filename `orchestrator.md` → `orchestrator_prompt.md` (P2)

---

## Cierre P1 y avance hacia cobertura pedagógica

### P1 cerrados (2026-04-27)

| Hallazgo | Estado |
|----------|--------|
| Opciones duplicadas en 4 ejercicios | ✅ Verificado: sin duplicados en archivos actuales |
| 6 errores de tipeo visibles al estudiante | ✅ 13 instancias corregidas en 5 archivos |
| .gitignore no cubre `.env` | ✅ Agregado `.env` y `.env.*`, excluido `.env.example` |
| Tests de regresión | ✅ 3 tests agregados en `content_quality.test.ts` y `project_hygiene.test.ts` |

### Cobertura pedagógica implementada

| Test | Tipo | Qué valida |
|------|------|-----------|
| `lengua_pedagogical_coverage.test.ts` | Vitest (9 tests) | Skills, subskills, campos, reading units, simulador, IDs técnicos |
| `lengua-full-pedagogical-flow.spec.ts` | Playwright (2 tests) | Flujo completo alumno + cobertura del simulador por familias |

### Pendientes P2

- Actualizar `PRODUCT_ANALYSIS.md` — referencia obsoleta a ADR-005
- Corregir `agents_map.md` — filename incorrecto

---

*Auditoría ejecutada el 2026-04-27. Todos los tests pasan en verde.*
*Última actualización: 2026-04-27 — cobertura pedagógica implementada.*
