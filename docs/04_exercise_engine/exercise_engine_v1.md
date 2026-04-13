# Exercise Engine v1 - App Ingreso

## Principios del sistema

- Cada ejercicio entrena una habilidad principal
- Los ejercicios son cortos y de baja fricción
- Feedback inmediato en cada respuesta
- Repetición con variación (misma lógica, distinto contenido)
- El sistema debe ser escalable y reutilizable

---

## Tipos de ejercicios

### 1. Opción múltiple (Multiple Choice)

**Descripción:**
El usuario elige una opción entre varias.

**Uso:**
- Comprensión literal
- Inferencia
- Vocabulario
- Tipo de texto

**Estructura:**
- enunciado
- 4 opciones
- 1 correcta
- distractores diseñados por error común

**Ventaja:**
Fácil de corregir y escalar

---

### 2. Completar (Fill in the blank)

**Descripción:**
El usuario completa una palabra o conector.

**Uso:**
- Cohesión
- Vocabulario

**Estructura:**
- oración con espacio vacío
- opciones o input libre

**Ventaja:**
Evalúa precisión en contexto

---

### 3. Ordenar (Ordering)

**Descripción:**
El usuario ordena elementos.

**Uso:**
- Cohesión
- Coherencia

**Estructura:**
- lista de oraciones desordenadas
- orden correcto

**Ventaja:**
Evalúa comprensión global

---

### 4. Identificación (Highlight / Selection)

**Descripción:**
Seleccionar parte correcta del texto.

**Uso:**
- Comprensión literal
- Narrador

**Estructura:**
- texto
- selección puntual

**Ventaja:**
Entrena lectura precisa

---

### 5. Clasificación (Categorization)

**Descripción:**
Asignar elementos a categorías.

**Uso:**
- Tipo de texto
- Consignas

**Estructura:**
- elementos
- categorías posibles

---

## Estructura base de un ejercicio

Cada ejercicio debe tener:

- id
- habilidad principal
- subhabilidad
- tipo de ejercicio
- dificultad (1–3)
- contenido (texto / oración / dato)
- opciones (si aplica)
- respuesta correcta
- explicación (feedback)

---

## Diseño de distractores (clave del sistema)

Los distractores NO son aleatorios.

Deben representar errores reales:

- lectura superficial
- confusión de conceptos
- interpretación incorrecta
- distractores plausibles

---

## Sistema de feedback

### Correcto
- Confirmación inmediata
- Refuerzo positivo
- Opcional: breve explicación

### Incorrecto
- Explicación clara
- Mostrar por qué está mal
- Indicar la lógica correcta

---

## Adaptatividad (versión inicial)

El sistema ajusta la práctica según:

- errores repetidos
- habilidad fallada
- nivel de dificultad

Reglas simples:

- falla → repetir habilidad
- acierto sostenido → subir dificultad
- error recurrente → bajar dificultad

---

## Repetición inteligente

- misma habilidad
- diferente contenido
- misma estructura

Objetivo:
Evitar memorización, forzar comprensión

---

## Relación con skills_map

Cada ejercicio debe mapearse a:

- 1 habilidad principal
- 1 subhabilidad

Esto permite:

- medir progreso real
- detectar debilidades
- adaptar entrenamiento

---

## Nota

El motor de ejercicios es el núcleo operativo del sistema.

Debe permitir:
- generar ejercicios fácilmente
- escalar contenido
- integrarse con el sistema adaptativo