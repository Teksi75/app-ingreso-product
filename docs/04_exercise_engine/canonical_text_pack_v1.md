# Canonical Text Pack V1

## Objetivo

Cerrar la primera incorporacion canonica de estimulos lectores de Lengua a partir del inventario de `textgroup_candidates.json`, sin convertirlos en modulos visibles y manteniendo seleccion skill-first.

## Candidatos priorizados

Se priorizaron exactamente cinco candidatos, uno por familia textual:

| Familia | Candidate ID | ReadingUnit ID | Decision de esta fase | Motivo principal |
|---|---|---|---|---|
| Biografia | `bio-001` | `RU-LEN-BIO-001` | incorporado y retenido | Ya tenia texto original, metadata canonica y cobertura amplia para skills tempranas. |
| Noticia periodistica | `not-001` | `RU-LEN-NOT-001` | incorporado | Mejor equilibrio entre paratextos periodisticos, comprension explicita/inferencial y gestion verbal en contexto. |
| Leyenda | `ley-001` | `RU-LEN-LEY-001` | incorporado | Reduce el riesgo de cercania con leyendas oficiales mendocinas y conserva una tradicion de origen explicitada. |
| Articulo enciclopedico | `enc-001` | `RU-LEN-ENC-001` | incorporado | Tema verificable, cercano al contexto argentino y util para comprension expositiva y sintaxis basica. |
| Cuento integrador | `cue-001` | `RU-LEN-CUE-001` | incorporado | Es el unico candidato integrador y aporta la mayor cobertura transversal para lectura skill-first. |

## Criterios de priorizacion

1. Cobertura skill-first sobre `lengua.skill_1`, `lengua.skill_2`, `lengua.skill_4`, `lengua.skill_5`, `lengua.skill_6` y `lengua.skill_7` con ejercicios minimos ya mapeados a subskills canonicas.
2. Riesgo legal bajo: todos los textos incorporados son originales internos o reescrituras internas desde tradiciones/public facts, sin copia de materiales oficiales ni de fuentes con licencia dudosa.
3. Control editorial: se privilegio un lote pequeno, con 5 `ReadingUnit` utilizables y sin expansion masiva de preguntas.
4. Compatibilidad inmediata con el runtime actual de `ReadingUnit` y con `recommendation` / `session_runner` sin reescritura del flujo.

## Assets incorporados

### Reading units

- `content/lengua/reading_units/bio_001_violeta_parra.json`
- `content/lengua/reading_units/not_001_festival_robots.json`
- `content/lengua/reading_units/ley_001_cantuta.json`
- `content/lengua/reading_units/enc_001_humedales.json`
- `content/lengua/reading_units/cue_001_maquina_recuerdos.json`

### Exercise sets asociados

- `content/lengua/exercises/bio_001_violeta_parra_m1.json`
- `content/lengua/exercises/not_001_festival_robots.json`
- `content/lengua/exercises/ley_001_cantuta.json`
- `content/lengua/exercises/enc_001_humedales.json`
- `content/lengua/exercises/cue_001_maquina_recuerdos.json`

Cada reading unit del nuevo lote sostiene al menos 3 ejercicios. En esta fase se incorporo solo la base minima para que el flujo reading-based sea utilizable y seleccionable por skills.

## Decision editorial sobre lo que no entro

Quedaron pendientes, sin incorporacion en esta fase:

- `bio-002` (`Carlos Gardel: el cantor que nadie olvida`)
- `not-002` (`Estudiantes mendocinos ganan concurso nacional de astronomia observacional`)
- `ley-002` (`La nina del cerro plateado`)
- `enc-002` (`La Ruta de la Seda: puente entre oriente y occidente`)

Motivos de postergacion:

1. Mantener un lote pequeno y controlado.
2. Evitar duplicacion prematura dentro de la misma familia textual.
3. Priorizar candidatos con menor riesgo de similitud con materiales oficiales o menor costo de verificacion editorial inicial.

## Riesgos abiertos

### Legales

1. `ley-001` sigue requiriendo revision cultural continua para evitar simplificaciones inadecuadas de tradiciones andinas, aunque la redaccion incorporada es original.
2. `bio-001` depende de hechos biograficos verificables; cualquier ampliacion futura debe mantener trazabilidad de fuentes factuales, no de redacciones derivadas.

### Pedagogicos

1. La cobertura de preguntas sigue siendo minima en noticia, leyenda, articulo y cuento; aun no alcanza el rango completo de 5-8 ejercicios por texto sugerido en el marco.
2. Falta una segunda vuelta de calibracion de dificultad por familia textual con alumnos objetivo de 11-12 anos.
3. Algunas habilidades previstas en el inventario quedaron solo preparadas en metadata editorial y todavia no cuentan con suficientes ejercicios derivados.

## Notas de implementacion

1. `moduleFit` se conserva como metadata interna de cobertura y no organiza la navegacion del alumno.
2. Se elimino el placeholder `reading_001` para que el pack canonico quede derivado del inventario curado, no de ejemplos genericos previos.
3. El runtime actual de `ReadingUnit` no se reescribio; solo se agregaron assets compatibles.
