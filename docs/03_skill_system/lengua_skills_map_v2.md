# Lengua Skills Map v2 - App Ingreso

## Principios del sistema

Este producto es un sistema de entrenamiento automático.

Se basa en:
- entrenamiento intensivo
- práctica repetitiva
- feedback inmediato
- detección de errores
- loop fijo: Pregunta → Respuesta → Feedback → Siguiente

El foco está en habilidades evaluables automáticamente, no en teoría.

---

## Tipos de ejercicio permitidos

- multiple_choice
- completion
- error_correction
- ordering
- text_selection

---

## Habilidades principales

### 1. Comprensión literal

**Descripción:**
Identificar información explícita en un texto.

**Subhabilidades entrenables:**
- identificar dato explícito exacto
- ubicar evidencia textual para una respuesta
- seleccionar enunciado que representa el sentido global

**Cómo se entrena:**
- multiple_choice
- text_selection

**Cómo se evalúa:**
- correcto/incorrecto por coincidencia con clave única
- score discreto por subhabilidad (0-1 por ítem)

---

### 2. Inferencia

**Descripción:**
Deducir información implícita con apoyo en evidencia textual.

**Subhabilidades entrenables:**
- seleccionar causa o consecuencia implícita compatible
- seleccionar intención implícita compatible con el fragmento
- elegir conclusión válida entre opciones cercanas

**Cómo se entrena:**
- multiple_choice
- text_selection

**Cómo se evalúa:**
- correcto/incorrecto según opción válida única
- score discreto por subhabilidad (0-1 por ítem)

---

### 3. Vocabulario en contexto

**Descripción:**
Interpretar palabras y expresiones según uso contextual.

**Subhabilidades entrenables:**
- seleccionar significado contextual correcto
- seleccionar reemplazo que conserva sentido y registro
- detectar opción léxica incompatible con el contexto

**Cómo se entrena:**
- multiple_choice
- completion
- text_selection

**Cómo se evalúa:**
- correcto/incorrecto por equivalencia definida en clave
- score discreto por subhabilidad (0-1 por ítem)

---

### 4. Cohesión y coherencia

**Descripción:**
Resolver relaciones lógicas y orden interno de ideas.

**Subhabilidades entrenables:**
- completar conector correcto según relación lógica
- ordenar oraciones para reconstruir secuencia coherente
- identificar oración que rompe la continuidad lógica

**Cómo se entrena:**
- completion
- ordering
- text_selection

**Cómo se evalúa:**
- correcto/incorrecto por secuencia u opción objetivo
- score discreto por subhabilidad (0-1 por ítem)

---

### 5. Tipo de texto

**Descripción:**
Identificar función comunicativa dominante y organización textual.

**Subhabilidades entrenables:**
- identificar función principal en contexto
- seleccionar estructura textual compatible con el fragmento
- distinguir función principal frente a funciones secundarias

**Cómo se entrena:**
- multiple_choice
- text_selection

**Cómo se evalúa:**
- correcto/incorrecto según clasificación objetivo
- score discreto por subhabilidad (0-1 por ítem)

---

### 6. Narrador y punto de vista

**Descripción:**
Identificar voz narrativa y perspectiva textual.

**Subhabilidades entrenables:**
- identificar tipo de voz narrativa por marcas lingüísticas
- identificar persona gramatical dominante en el fragmento
- detectar cambio explícito de perspectiva en secuencias breves

**Cómo se entrena:**
- multiple_choice
- text_selection
- ordering

**Cómo se evalúa:**
- correcto/incorrecto por etiqueta o secuencia correcta
- score discreto por subhabilidad (0-1 por ítem)

---

### 7. Interpretación de consignas

**Descripción:**
Identificar exactamente qué acción exige una consigna.

**Subhabilidades entrenables:**
- identificar operador principal de la consigna (marcar, completar, ordenar, corregir)
- identificar restricción crítica (excepto, no, solo, siempre)
- seleccionar respuesta que cumple condición explícita de la consigna

**Cómo se entrena:**
- multiple_choice
- text_selection
- completion

**Cómo se evalúa:**
- correcto/incorrecto por cumplimiento de condición única
- score discreto por subhabilidad (0-1 por ítem)

---

## Relación con evaluación

### Ejercicios
Cada ejercicio entrena una habilidad principal y una subhabilidad verificable automáticamente.

### Simulaciones
Combinan múltiples habilidades manteniendo el loop fijo: Pregunta → Respuesta → Feedback → Siguiente.

### Progreso del alumno
Se mide por habilidad y subhabilidad con métricas discretas:
- acierto por ítem (0/1)
- precisión por habilidad (%)
- racha de aciertos (entero)
- tiempo de respuesta por ítem (segundos)

---

## Criterios de dominio

| Nivel | Descripción | Condición |
|------|------------|----------|
| Inicial | Alto error | <60% aciertos |
| En progreso | Mejora parcial | 60–85% |
| Dominado | Alta precisión sostenida | >85% |

---

## Validación de automatización

1. Ninguna habilidad requiere evaluación humana.
2. Todas las subhabilidades se evalúan con clave verificable en el loop Pregunta → Respuesta → Feedback automático.
3. La lista de tipos de ejercicio es de 5 tipos (máximo permitido).
