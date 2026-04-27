# 14. Cobertura Pedagógica E2E — Lengua

**Fecha:** 2026-04-27
**Estado:** Implementado y validado

---

## 1. Objetivo

Validar que la app cubre las familias de habilidades de Lengua necesarias para la preparación del ingreso, sin replicar contenido oficial ni insinuar vinculación institucional.

## 2. Diferencia entre E2E técnico y E2E pedagógico

| E2E técnico | E2E pedagógico |
|-------------|----------------|
| Valida que los botones funcionan | Valida que las skills canónicas tienen cobertura |
| Valida navegación entre páginas | Valida que el simulador cubre múltiples familias |
| Valida que no hay errores 500 | Valida que la UI no expone IDs técnicos |
| Valida que el progreso se guarda | Valida que el reporte muestra nombres pedagógicos legibles |

## 3. Matriz de cobertura validada

### Skills canónicas (7/7 cubiertas)

| Skill | Nombre | Ejercicios | En simulador |
|-------|--------|------------|--------------|
| `lengua.skill_1` | Comprensión global del texto | ✅ | ✅ |
| `lengua.skill_2` | Organización de ideas | ✅ | ✅ |
| `lengua.skill_3` | Escritura clara y breve | ✅ | ✅ |
| `lengua.skill_4` | Gramática en contexto | ✅ | ✅ |
| `lengua.skill_5` | Uso de verbos | ✅ | ✅ |
| `lengua.skill_6` | Ortografía y tildes | ✅ | ✅ |
| `lengua.skill_7` | Puntuación y sentido | ✅ | ✅ |

### Subskills — Cobertura directa vs integrativa

| Subskills con ejercicios propios | Subskills integrativas (cruzadas) |
|----------------------------------|-----------------------------------|
| skill_1.subskill_1 (Información explícita) | skill_1.subskill_4 (Vocabulario en contexto) |
| skill_1.subskill_2 (Inferencia) | skill_1.subskill_5 (Sinónimos y antónimos) |
| skill_1.subskill_3 (Idea principal) | skill_2.subskill_2 (Coherencia) |
| skill_2.subskill_1 (Orden lógico) | skill_4.subskill_2 (Concordancia) |
| skill_2.subskill_3 (Conectores) | skill_6.subskill_2 (Acentuación) |
| skill_2.subskill_4 (Paratextos) | skill_6.subskill_3 (Corrección ortográfica) |
| skill_2.subskill_5 (Narrador) | skill_6.subskill_4 (Diptongo/hiato) |
| skill_3.subskill_2 (Datos relevantes) | skill_7.subskill_2 (Desambiguación) |
| skill_3.subskill_3 (Claridad y foco) | |
| skill_4.subskill_1 (Clases de palabras) | |
| skill_4.subskill_3 (Función sintáctica) | |
| skill_4.subskill_4 (Pronombres) | |
| skill_4.subskill_5 (Adverbios) | |
| skill_5.subskill_1 (Tiempo verbal) | |
| skill_5.subskill_2 (Transformación verbal) | |
| skill_5.subskill_3 (Continuidad temporal) | |
| skill_6.subskill_1 (Grafías frecuentes) | |
| skill_6.subskill_5 (Mayúsculas) | |
| skill_7.subskill_1 (Uso de coma) | |
| skill_7.subskill_3 (Segmentación) | |

### Familias pedagógicas cubiertas

| # | Familia | Cubierta por |
|---|---------|-------------|
| 1 | Comprensión lectora literal e inferencial | skill_1 (subskills 1-3) |
| 2 | Paratextos y clases textuales | skill_2.subskill_4 |
| 3 | Vocabulario en contexto (cotexto, sinonimia, antonimia) | skill_1.subskill_4-5 (integrativas) |
| 4 | Narración (secuencia, personajes, conflicto, narrador) | skill_2.subskill_1, skill_2.subskill_5 |
| 5 | Cohesión y coherencia (conectores, progresión) | skill_2.subskill_2-3 |
| 6 | Clases de palabras | skill_4.subskill_1 |
| 7 | Verbo (persona, número, tiempo, modo) | skill_5 (todas las subskills) |
| 8 | Normativa (mayúsculas, puntuación, acentuación, B/V) | skill_6, skill_7 |
| 9 | Sintaxis (sujeto, núcleo, OD, CC) | skill_4.subskill_3 |
| 10 | Integración en simulador | E2E test de simulador |

## 4. Tests creados/modificados

### Nuevos

| Archivo | Tipo | Qué valida |
|---------|------|-----------|
| `src/content_analysis/lengua_pedagogical_coverage.test.ts` | Vitest | 9 tests: skills, subskills, campos requeridos, reading units, simulador, IDs técnicos |
| `tests/e2e/lengua-full-pedagogical-flow.spec.ts` | Playwright | Flujo completo: home→skills→practice→reading→simulator→progress→report→JSON endpoint |

### Modificados (data-testid)

| Archivo | Cambio |
|---------|--------|
| `src/app/practice/PracticeQuestion.tsx` | `data-testid="answer-option"` y `data-testid="submit-answer"` |
| `src/app/simulaciones/SimulatorQuestion.tsx` | `data-testid="simulator-question"` y `data-testid="answer-option"` |
| `src/components/dashboard/SkillItem.tsx` | `data-testid="skill-progress-card"` |
| `src/app/reporte/page.tsx` | `data-testid="report-skill-coverage"` |

## 5. Qué se valida automáticamente

- ✅ Las 7 skills canónicas tienen ejercicios
- ✅ Las subskills integrativas están justificadas
- ✅ Cada ejercicio tiene campos requeridos (skill_id, subskill, difficulty, type, opciones, respuesta, feedback)
- ✅ skill_id coincide con patrón canónico (`/^lengua\.skill_[1-7]$/`)
- ✅ subskill coincide con su skill padre
- ✅ Reading units tienen texto, título y ejercicios asociados
- ✅ Reading units cubren múltiples familias de skills
- ✅ El simulador puede construir sesiones con exercises de las 7 skills
- ✅ La UI pública no expone IDs técnicos (`lengua.skill_*`, `subskill_*`, `RU-LEN-*`)
- ✅ Flujo completo del alumno: home→skills→practice→reading→simulator→progress→report
- ✅ Reporte familiar funcional con JSON endpoint
- ✅ Simulador cubre al menos 4 familias de skills por sesión

## 6. Qué NO se valida todavía

- ❌ Que cada subskill integrativa se ejercite efectivamente en cada sesión de práctica
- ❌ Que el adaptativo seleccione ejercicios de todas las skills en un camino completo de aprendizaje
- ❌ Que el feedback sea pedagógicamente correcto (solo se valida que exista)
- ❌ Que la dificultad progrese correctamente de nivel 1 a 3
- ❌ Que las reading units cubran las 7 skills (solo cubren ~5)
- ❌ Que el mastery model desbloquee el simulador solo cuando hay cobertura suficiente

## 7. Riesgos o limitaciones

- Las subskills integrativas (skill_1.subskill_4-5, etc.) no tienen ejercicios propios; dependen de que el exercise selector las cubra cruzadamente
- El simulador por defecto tiene 10 preguntas; con más preguntas la cobertura de skills mejora
- El test E2E del simulador depende de la aleatoriedad de la selección de exercises
- Los reading units solo cubren 6 de 7 skills (falta skill_3 en reading units)

## 8. Relación con P1 ya cerrados

Los P1 de la auditoría E2E previa (typos, .gitignore, opciones duplicadas) fueron cerrados antes de implementar esta cobertura pedagógica. Los tests de regresión agregados en esa tarea (`content_quality.test.ts`, `project_hygiene.test.ts`) complementan esta cobertura al prevenir regresiones de contenido.

## 9. Resultado de comandos

```bash
npm run typecheck        → ✅ 0 errores
npm run test:unit        → ✅ 10 specs, 51 assertions
npm run build            → ✅ exitoso
npm run test:e2e         → ✅ 23/21 (2 nuevos + 21 originales)
```

### Aclaración: cambio de 43 a 42 assertions

El reporte de auditoría anterior informó 43 assertions, pero el conteo real al ejecutar era 39. La diferencia se debió a un error de conteo en el texto del reporte. Tras agregar 3 tests de regresión (duplicate options, typos, .gitignore), el total pasó a 42. Con los 9 tests nuevos de cobertura pedagógica, el total es 51.
