# Auditoria de ejercicios Lengua - Modulo 3 (migracion)

## Set auditado

- Archivo: `lengua_exercises_modulo3.json`
- Cantidad de ejercicios: 29
- Origen: original, no derivado de contenido oficial

## Verificacion por habilidad

### Comprension (noticia) - 14 ejercicios

| ID | Skill | Subskill | Dificultad | Loop completo | Distractores | Feedback |
|----|-------|----------|-----------|--------------|-------------|----------|
| LEN-EX-037 | LEN-COMP-001 | reconocer tema central | 1 | OK | OK | OK |
| LEN-EX-038 | LEN-COMP-002 | ubicar datos puntuales | 1 | OK | OK | OK |
| LEN-EX-039 | LEN-COMP-003 | inferir causa o consecuencia | 2 | OK | OK | OK |
| LEN-EX-057 | LEN-COMP-003 | inferir causa o consecuencia | 1 | OK | OK | OK |
| LEN-EX-058 | LEN-COMP-003 | inferir causa o consecuencia | 1 | OK | OK | OK |
| LEN-EX-059 | LEN-COMP-003 | inferir causa o consecuencia | 2 | OK | OK | OK |
| LEN-EX-060 | LEN-COMP-003 | inferir causa o consecuencia | 2 | OK | OK | OK |
| LEN-EX-061 | LEN-COMP-003 | inferir causa o consecuencia | 2 | OK | OK | OK |
| LEN-EX-062 | LEN-COMP-003 | inferir causa o consecuencia | 2 | OK | OK | OK |
| LEN-EX-063 | LEN-COMP-003 | inferir causa o consecuencia | 3 | OK | OK | OK |
| LEN-EX-064 | LEN-COMP-003 | inferir causa o consecuencia | 3 | OK | OK | OK |
| LEN-EX-065 | LEN-COMP-003 | inferir causa o consecuencia | 3 | OK | OK | OK |
| LEN-EX-040 | LEN-COMP-004 | identificar intencion informativa | 2 | OK | OK | OK |
| LEN-EX-041 | LEN-COMP-002 | distinguir dato textual de inferencia | 3 | OK | OK | OK |

### Vocabulario en contexto - 5 ejercicios

| ID | Skill | Subskill | Dificultad | Loop completo | Distractores | Feedback |
|----|-------|----------|-----------|--------------|-------------|----------|
| LEN-EX-042 | LEN-VOC-001 | inferir significado por pistas cercanas | 2 | OK | OK | OK |
| LEN-EX-043 | LEN-VOC-001 | reconocer acepcion adecuada | 2 | OK | OK | OK |
| LEN-EX-044 | LEN-VOC-001 | interpretar expresiones no literales | 3 | OK | OK | OK |
| LEN-EX-045 | LEN-VOC-002 | reconocer sinonimos contextuales | 1 | OK | OK | OK |
| LEN-EX-046 | LEN-VOC-002 | evitar cambios de intensidad | 3 | OK | OK | OK |

### Gramatica (tiempos verbales) - 5 ejercicios

| ID | Skill | Subskill | Dificultad | Loop completo | Distractores | Feedback |
|----|-------|----------|-----------|--------------|-------------|----------|
| LEN-EX-047 | LEN-GRAM-001 | identificar tiempo verbal | 1 | OK | OK | OK |
| LEN-EX-048 | LEN-GRAM-001 | mantener coherencia temporal | 2 | OK | OK | OK |
| LEN-EX-049 | LEN-GRAM-001 | reconocer anterioridad o posterioridad | 2 | OK - ver nota | OK | OK |
| LEN-EX-050 | LEN-GRAM-001 | seleccionar forma verbal compatible | 3 | OK | OK | OK |
| LEN-EX-051 | LEN-GRAM-001 | mantener coherencia temporal | 3 | OK | OK | OK |

### Normativa (diptongo/hiato/triptongo) - 5 ejercicios

| ID | Skill | Subskill | Dificultad | Loop completo | Distractores | Feedback |
|----|-------|----------|-----------|--------------|-------------|----------|
| LEN-EX-052 | LEN-NORM-003 | reconocer diptongo | 1 | OK | OK | OK |
| LEN-EX-053 | LEN-NORM-003 | reconocer hiato | 2 | OK | OK | OK |
| LEN-EX-054 | LEN-NORM-003 | separar silabas con diptongo | 2 | OK | OK | OK |
| LEN-EX-055 | LEN-NORM-003 | separar silabas con hiato | 3 | OK | OK | OK |
| LEN-EX-056 | LEN-NORM-003 | reconocer triptongo | 3 | OK | OK | OK |

## Hallazgos P1

1. **LEN-EX-049**: La opcion `"cruzaran"` aparece dos veces en las opciones (posicion 2 y 4). Se duplica un distractor. Debe corregirse.

## Hallazgos P2

1. **LEN-EX-052 y LEN-EX-053**: Los ejercicios incluyen una frase context en el campo `text` pero no usan ese texto en la consigna. Consistencia menor: algunos ejercicios usan `text` como contexto y otros dejan `text` vacio. No bloquea el funcionamiento.

2. **LEN-EX-056**: La palabra "miau" (miau) como ejemplo de triptongo es correcta fonologicamente, pero el triptongo se forma con la union vocalica i-a-u. La consigna dice "tres vocales juntas" que es preciso, pero podria generar confusion si el estudiante no distingue la u como vocal. No bloqueante.

## Loop central

- Pregunta presente: OK (todos los ejercicios tienen consigna)
- Respuesta verificable: OK (todos tienen respuesta correcta unica)
- Feedback inmediato: OK (todos tienen feedback_correct e feedback_incorrect)
- Ajuste: OK (el sistema puede ofrecer repeticion por habilidad)
- Siguiente: OK (el motor puede seleccionar el proximo ejercicio por skill_id)

## Verificacion de restricciones

- No contiene contenido oficial: OK - textos y ejemplos son originales
- No contiene explicaciones largas: OK - feedback es breve (1 linea)
- No deriva hacia curso/modulo: OK - cada ejercicio es independiente
- No requiere texto previo: OK - textos breves estan incluidos en cada ejercicio
- No usa contenido de modulos UNCuyo: OK - contenido original

## Resultado

- estado: APPROVED
- severidad: P2 (observaciones no bloqueantes)
- P1 corregido: LEN-EX-049 opcion duplicada reemplazada por "cruzaron"

## Pendientes P2 (no bloqueantes)

1. Consistencia del campo `text`: algunos ejercicios usan text como contexto, otros lo dejan vacio. Normalizar en siguiente iteracion.
2. LEN-EX-056: miau como ejemplo de triptongo puede generar confusion si el estudiante no distingue la u como vocal. Considerar ejemplo alternativo en futuro.

## Aprobacion

El set de 29 ejercicios esta aprobado para integrarse al motor de ejercicios.
