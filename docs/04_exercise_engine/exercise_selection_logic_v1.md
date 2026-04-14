# Exercise Selection Logic v1

## Proposito

Definir la logica minima para seleccionar el siguiente ejercicio despues de cada respuesta.

Esta logica cierra el loop:

```text
Pregunta -> Respuesta -> Feedback -> Siguiente
```

## Input

El selector recibe historial de respuestas del usuario.

Campos minimos por respuesta:

- `exercise_id`
- `skill_id`
- `subskill`
- `difficulty`
- `result`: `correct` o `incorrect`
- `time_seconds`: opcional

No requiere datos personales.

## Output

El selector devuelve:

```text
next_exercise_id
```

## Reglas de seleccion

### Caso 1 - Error

Si la ultima respuesta fue incorrecta:

- repetir la misma `skill_id`
- usar la misma dificultad o una menor
- variar el ejercicio
- evitar repetir el mismo `exercise_id` de forma inmediata

Objetivo:

- reforzar la habilidad fallada sin cortar el flujo de practica.

### Caso 2 - Acierto

Si la ultima respuesta fue correcta:

- mantener la misma `skill_id` y cambiar `subskill`, si hay opciones disponibles
- subir dificultad solo si hay aciertos consistentes
- si no hay ejercicio disponible en mayor dificultad, rotar a otra skill prioritaria

Acierto consistente:

- al menos 2 aciertos recientes en la misma `skill_id`
- sin error reciente en esa `skill_id`

### Caso 3 - Error recurrente

Si una `skill_id` acumula errores recientes:

- priorizar esa `skill_id`
- bajar dificultad
- aumentar frecuencia de aparicion
- mantener variacion de ejercicios

Error recurrente:

- 2 o mas errores en las ultimas 3 respuestas de la misma `skill_id`

## Prioridad

Cada `skill_id` recibe prioridad simple segun desempeno reciente.

Reglas:

- mas errores recientes -> mayor prioridad
- errores recurrentes -> prioridad maxima
- aciertos consistentes -> menor frecuencia
- skills sin practica reciente -> prioridad media

Orden sugerido:

1. skills con error recurrente
2. skill de la ultima respuesta incorrecta
3. skills con mas errores acumulados
4. skills sin practica reciente
5. skills dominadas

## Variacion

El selector debe evitar repeticion mecanica.

Reglas:

- no repetir el mismo `exercise_id` inmediatamente
- rotar ejercicios dentro de la misma `skill_id`
- alternar `subskill` cuando sea posible
- usar otro ejercicio equivalente si la dificultad recomendada no esta disponible

Si solo existe un ejercicio disponible para una `skill_id`, puede repetirse despues de al menos una respuesta intermedia.

## Dominio de skill

Una skill se considera dominada de forma inicial si:

- tiene al menos 3 respuestas recientes
- las ultimas 3 respuestas fueron correctas
- no hubo error reciente en dificultad igual o menor

Una skill dominada no desaparece del flujo.

Debe aparecer con menor frecuencia para mantener practica distribuida.

## Algoritmo minimo

```text
1. Leer ultima respuesta.
2. Calcular errores recientes por skill_id.
3. Detectar error recurrente.
4. Elegir skill prioritaria.
5. Elegir dificultad:
   - error: misma o menor
   - error recurrente: menor disponible
   - acierto consistente: mayor disponible
   - acierto simple: misma dificultad o cambio de subskill
6. Excluir el ultimo exercise_id.
7. Seleccionar un ejercicio disponible.
8. Devolver next_exercise_id.
```

## Restricciones

- no usar IA compleja
- no usar modelos predictivos
- no depender de UI
- no usar datos personales
- mantener reglas simples y auditables
- seleccionar siempre desde ejercicios validados

## Criterios de aceptacion

La logica es valida si:

- responde distinto a aciertos y errores
- no repite ejercicios de forma inmediata
- prioriza debilidades
- reduce frecuencia de skills dominadas
- puede implementarse con reglas simples
- devuelve siempre `next_exercise_id`
