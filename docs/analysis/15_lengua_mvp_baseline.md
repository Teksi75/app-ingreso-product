# 15. Baseline Estable — Lengua MVP

**Fecha:** 2026-04-27
**Estado:** Estable y retomable

---

## 1. Estado del hito

El proyecto alcanzó un estado estable donde:

- El MVP funcional de Lengua está completo (práctica standalone, lectura guiada, simulador, progreso, reporte familiar).
- La cobertura pedagógica está validada automáticamente.
- Los hallazgos de auditoría P1 y P2 están cerrados.
- Todos los tests pasan en verde.
- El knowledge graph está sincronizado con el código.

## 2. Commits relevantes

| Commit | Descripción |
|--------|-------------|
| `d52d687` | E2E pedagógico completo de Lengua — tests unitarios de cobertura, tests E2E de flujo completo, data-testid, corrección de typos, .gitignore |
| `d1ac812` | Actualización del knowledge graph tras los tests pedagógicos |
| `115d367` | Cierre de P2 documentales — PRODUCT_ANALYSIS.md y agents_map.md |

## 3. Qué queda garantizado por tests

### Cobertura de skills (unitario)

- Las 7 skills canónicas de Lengua tienen ejercicios en `content/lengua/exercises/`.
- Las subskills sin ejercicios propios están marcadas como integrativas y justificadas.
- Cada ejercicio tiene campos requeridos: skill_id, subskill, difficulty, type, opciones, respuesta, feedback.
- skill_id coincide con patrón canónico `/^lengua\.skill_[1-7]$/`.
- subskill coincide con su skill padre.

### Subskills no huérfanas (unitario)

- 21 subskills tienen ejercicios directos.
- 8 subskills integrativas están documentadas como dependientes de ejercicio cruzado.

### Simulador con cobertura canónica (unitario + E2E)

- El simulador puede construir sesiones con exercises de las 7 skills.
- El test E2E verifica que una sesión cubre al menos 4 familias de skills.
- La selección round-robin por skill garantiza distribución balanceada.

### Flujo completo de alumno (E2E)

- Home → Habilidades → Práctica (training) → Lectura (reading) → Simulador → Progreso → Reporte → JSON endpoint.
- El test genera un código único, navega todas las páginas, responde preguntas, verifica resultados.

### Progreso (unitario + E2E)

- El progreso se persiste por código de estudiante (JSON local o Redis).
- El mastery model computa niveles, estados y readiness del simulador.
- La recomendación de siguiente paso prioriza correctamente.

### Reporte familiar (E2E)

- `/reporte?code=...` muestra datos sin IDs técnicos.
- `/reporte/datos?code=...&format=json` devuelve JSON con summary, skills y weeklyData.

### No exposición de IDs técnicos (unitario + E2E)

- Ningún ejercicio expone `lengua.skill_*`, `subskill_*` o `RU-LEN-*` en texto visible al alumno.
- Los tests E2E verifican que home, habilidades, práctica, simulador, progreso y reporte no contienen estos patrones.

### Higiene de contenido (unitario)

- Sin opciones duplicadas en ejercicios.
- Sin typos conocidos (`varíos`, `sitúación`, `opiniónes`, `cuálquier`, `estan`).
- `.gitignore` cubre `.env` y `.env.*`.
- Content quality test previene regresiones de acentuación y encoding.

## 4. Qué NO queda garantizado

| Limitación | Por qué |
|------------|---------|
| Aprendizaje real | Los tests validan que la app funciona, no que el alumno aprende |
| Aprobación del examen | El producto no promete ni debe prometer aprobación (ADR-004) |
| Calidad profunda de distractores | Los tests verifican que existen 2+ opciones, no que sean pedagógicamente plausibles |
| Calibración empírica de dificultad | Los niveles 1-2-3 están declarados, no validados con datos reales |
| Suficiencia cuantitativa por subskill | Algunas subskills tienen pocos ejercicios; no hay mínimo declarado |
| Validación con alumnos reales | No se testea con usuarios reales del producto |

## 5. Riesgos próximos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Subskills integrativas sin ejercicios propios pueden no cubrirse en todas las sesiones | Media | Auditar que el exercise selector las incluye en sesiones representativas |
| Reading units cubren solo ~5 de 7 skills (falta skill_3) | Media | Crear al menos una reading unit que incluya ejercicios de producción escrita |
| El mastery model puede desbloquear el simulador antes de cubrir todas las skills | Baja | El test E2E verifica cobertura mínima de 4 familias, pero la calibración es empírica |
| Los feedbacks no han sido auditados pedagógicamente | Media | Requiere auditoría manual de un especialista en Lengua |
| El producto no tiene validación con alumnos reales | Alta | Próximo paso crítico |

## 6. Próximo paso recomendado

### Fase 1: Auditoría pedagógica manual

Antes de cualquier expansión, validar con un especialista:

1. **Dificultad**: ¿Los niveles 1-2-3 corresponden a dificultad real creciente?
2. **Glosario**: ¿Los términos en reading units son apropiados para el nivel?
3. **Feedback**: ¿Los mensajes de correcto/incorrecto son pedagógicamente efectivos?
4. **Cantidad mínima**: ¿Hay ejercicios suficientes por subskill para que la práctica sea efectiva?
5. **Distractores**: ¿Las opciones incorrectas son plausibles y pedagógicamente útiles?

### Fase 2: Validación con alumnos reales

Con 2-3 alumnos del nivel objetivo:

1. Observar si completan el flujo sin ayuda.
2. Medir si el feedback les resulta útil.
3. Verificar si la dificultad percibida coincide con la declarada.
4. Identificar puntos de abandono o confusión.

### Fase 3: Expansión (post-validación)

Solo después de las fases anteriores:

- Ampliar reading units para cubrir skill_3.
- Agregar ejercicios a subskills con poca cobertura.
- Implementar Matemática (si se decide).
- Explorar backend y autenticación.
