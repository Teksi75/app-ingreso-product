# Progress Metrics v1

## Proposito

Definir metricas simples de progreso por habilidad a partir del historial de respuestas de una sesion.

Las metricas sirven para detectar debilidades y adaptar practica futura.

## Input

Historial de respuestas:

- `skill_id`
- `result`: `correct` o `incorrect`
- `difficulty`
- `exercise_id`

No requiere datos personales.

## Metricas por skill

### attempts

Cantidad total de intentos en una `skill_id`.

```text
attempts = correct + incorrect
```

### accuracy

Porcentaje de aciertos.

```text
accuracy = correct / attempts
```

### error_rate

Porcentaje de errores.

```text
error_rate = incorrect / attempts
```

### consistency

Medicion simple de estabilidad reciente.

- `alta`: acierta 2 o mas seguidas en la misma skill
- `baja`: alterna resultados o falla en intentos recientes

## Clasificacion

Estado por skill:

- `weak`: `accuracy < 50%`
- `developing`: `accuracy >= 50%` y `accuracy <= 75%`
- `mastered`: `accuracy > 75%`

## Output esperado

Por cada skill practicada:

```text
[LEN-COMP-001]
accuracy: 60%
estado: developing
```

## Restricciones

- no usar ML
- no usar modelos complejos
- no depender de UI
- mantener calculos simples y auditables

## Criterios de aceptacion

El sistema es valido si:

- cada skill practicada tiene metricas claras
- se puede identificar una debilidad
- las metricas pueden alimentar la seleccion futura
- los calculos son entendibles y reproducibles
