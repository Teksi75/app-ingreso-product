# Practice Session Flow v1

## Proposito

Definir la logica de una sesion de practica que ejecuta el loop completo:

```text
Pregunta -> Respuesta -> Feedback -> Ajuste -> Siguiente
```

La sesion debe iniciar rapido, sostener practica continua y no depender de intervencion externa.

## Inicio de sesion

La sesion comienza sin pedir datos personales.

Reglas:

- iniciar directamente en practica
- seleccionar primer ejercicio de forma aleatoria o baseline
- usar solo ejercicios validados
- evitar pantallas intermedias

Primer ejercicio:

- si no hay historial, elegir un ejercicio baseline de dificultad `1`
- si hay historial, elegir una skill prioritaria segun `exercise_selection_logic_v1.md`

## Loop principal

Cada iteracion ejecuta estos pasos:

### STEP 1 - Mostrar ejercicio

Mostrar un ejercicio activo con:

- `id`
- `skill_id`
- `subskill`
- `difficulty`
- `prompt`
- `options`

### STEP 2 - Usuario responde

Registrar la opcion elegida por el usuario.

No mostrar teoria ni ayuda previa.

### STEP 3 - Validar respuesta

Comparar la respuesta elegida con `correct_answer`.

Resultado posible:

- `correct`
- `incorrect`

### STEP 4 - Mostrar feedback inmediato

Si la respuesta es correcta:

- mostrar `feedback_correct`

Si la respuesta es incorrecta:

- mostrar `feedback_incorrect`

El feedback debe ser breve y accionable.

### STEP 5 - Registrar resultado

Guardar un registro minimo:

- `exercise_id`
- `skill_id`
- `subskill`
- `difficulty`
- `result`
- `time_seconds`, si existe

No guardar datos personales.

### STEP 6 - Seleccionar siguiente ejercicio

Usar:

```text
docs/04_exercise_engine/exercise_selection_logic_v1.md
```

Output esperado:

```text
next_exercise_id
```

El siguiente ejercicio debe respetar:

- errores -> repetir skill con variacion
- aciertos -> avanzar o rotar subskill
- errores recurrentes -> priorizar skill y bajar dificultad
- no repetir el mismo ejercicio inmediatamente

## Finalizacion

La sesion termina por una condicion simple:

- cantidad fija de ejercicios, por ejemplo `10`
- corte manual del usuario

Al finalizar, mostrar resumen simple:

- aciertos totales
- errores totales
- errores por `skill_id`

No mostrar metricas complejas.

## Restricciones

- sin teoria
- sin pantallas intermedias
- sin navegacion por modulos
- sin tutor
- sin explicacion larga
- sin datos personales
- sin contenido oficial

## Experiencia

La experiencia debe priorizar:

- friccion minima
- respuesta inmediata
- continuidad de practica
- foco en resolver ejercicios
- avance automatico al siguiente ejercicio

## Criterios de aceptacion

El flujo es valido si:

- puede ejecutarse sin UI
- cada paso es deterministico
- puede continuar indefinidamente
- no depende de intervencion externa
- registra resultados suficientes para elegir el siguiente ejercicio
- mantiene el loop pregunta -> respuesta -> feedback -> ajuste -> siguiente
