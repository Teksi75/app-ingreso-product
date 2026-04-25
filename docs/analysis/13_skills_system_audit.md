# Auditoria 13 - Sistema de skills y subskills

Fecha: 2026-04-24

## Estado general

**Correcto.**

El sistema esta semanticamente alineado en metadata, grafo pedagogico y normalizacion runtime: los 36 nodos canonicos del mapa de mastery tienen metadata legible, las 38 relaciones apuntan a nodos existentes y el corpus runtime de 285 ejercicios normalizados no contiene skills/subskills inexistentes.

La cobertura de las 5 subskills que estaban huerfanas fue cerrada con 26 ejercicios nuevos. Todas las subskills canonicas tienen al menos 2 ejercicios y las subskills objetivo de cierre tienen al menos 4.

## Chequeo de UI

### Resultado

**UI renderizada limpia en practica, simulador y dashboard.**

No se detectaron renderizados directos de `lengua.skill_*` ni `subskill_*` como texto visible en:

- `src/app/practice/PracticeQuestion.tsx`
- `src/app/simulaciones/SimulatorQuestion.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/*`

Los puntos visibles revisados usan `getSkillMetadata(...)`:

- Practica: banner de habilidad, foco actual, chip de pregunta y mapa de dominio.
- Simulador: chip de habilidad, subskill de pregunta, resultado por habilidad y habilidad a reforzar.
- Dashboard: tarjetas de skills.

### Hallazgos relacionados

No son leaks de texto renderizado, pero si exposicion tecnica en rutas/estado:

- `src/app/page.tsx`: links como `/practice?mode=training&skill=lengua.skill_1`.
- `src/app/habilidades/page.tsx`: links como `/practice?mode=training&skill=lengua.skill_1`.
- `src/app/simulaciones/SimulatorQuestion.tsx`: `href={`/practice?skill=${result.weakSkill}`}` expone el ID tecnico en la URL.
- `src/app/practice/PracticeQuestion.tsx`: `buildPracticeHref(...)` arma URLs con `skill` y `focus` tecnicos.

Propuesta futura: mantener IDs internos, pero usar slugs legibles u opaque IDs en URLs publicas, por ejemplo `habilidad=comprension-global` y resolverlo internamente a `lengua.skill_1`.

## Cobertura de metadata

### Resultado

**Completa contra el mapa de mastery.**

- Nodos canonicos en `lengua_mastery_map.json`: 36.
- Skills principales: 7.
- Subskills: 29.
- Entradas `lengua.skill_*` / `lengua.skill_*.subskill_*` en `skill_metadata.ts`: 36.
- Faltantes de metadata: 0.
- Metadata extra sin nodo canonico: 0.

`skills_map.md` no declara IDs en cada bullet, pero por correspondencia ordinal y semantica las 7 skills y 29 subskills estan representadas en `skill_metadata.ts`.

## Cobertura de contenido

Fuente auditada principal: corpus runtime normalizado por `loadLenguaExercises()`.

- Ejercicios normalizados: 285.
- Ejercicios con skill/subskill inexistente: 0.
- Skills sin ejercicios: 0.
- Subskills sin ejercicios: 0.

### Cobertura por skill

| Skill | Ejercicios |
|---|---:|
| `lengua.skill_1` | 81 |
| `lengua.skill_2` | 36 |
| `lengua.skill_3` | 21 |
| `lengua.skill_4` | 43 |
| `lengua.skill_5` | 32 |
| `lengua.skill_6` | 42 |
| `lengua.skill_7` | 30 |

### Cobertura por subskill

| Subskill | Label | Ejercicios |
|---|---|---:|
| `lengua.skill_1.subskill_1` | Informacion explicita | 20 |
| `lengua.skill_1.subskill_2` | Inferencia | 39 |
| `lengua.skill_1.subskill_3` | Idea principal | 15 |
| `lengua.skill_1.subskill_4` | Vocabulario en contexto | 5 |
| `lengua.skill_1.subskill_5` | Sinonimos y antonimos | 2 |
| `lengua.skill_2.subskill_1` | Orden logico | 14 |
| `lengua.skill_2.subskill_2` | Coherencia | 11 |
| `lengua.skill_2.subskill_3` | Conectores | 2 |
| `lengua.skill_2.subskill_4` | Tipos de texto y paratextos | 5 |
| `lengua.skill_2.subskill_5` | Narrador y punto de vista | 4 |
| `lengua.skill_3.subskill_1` | Formato de respuesta | 7 |
| `lengua.skill_3.subskill_2` | Datos relevantes | 5 |
| `lengua.skill_3.subskill_3` | Claridad y foco | 9 |
| `lengua.skill_4.subskill_1` | Clases de palabras | 12 |
| `lengua.skill_4.subskill_2` | Concordancia | 9 |
| `lengua.skill_4.subskill_3` | Funcion sintactica | 10 |
| `lengua.skill_4.subskill_4` | Pronombres y determinantes | 6 |
| `lengua.skill_4.subskill_5` | Adverbios y modificadores | 6 |
| `lengua.skill_5.subskill_1` | Tiempo y modo verbal | 11 |
| `lengua.skill_5.subskill_2` | Transformacion verbal | 8 |
| `lengua.skill_5.subskill_3` | Continuidad temporal | 13 |
| `lengua.skill_6.subskill_1` | Grafias frecuentes | 11 |
| `lengua.skill_6.subskill_2` | Acentuacion | 10 |
| `lengua.skill_6.subskill_3` | Correccion ortografica | 9 |
| `lengua.skill_6.subskill_4` | Diptongo, hiato y triptongo | 7 |
| `lengua.skill_6.subskill_5` | Mayusculas | 5 |
| `lengua.skill_7.subskill_1` | Uso de coma | 12 |
| `lengua.skill_7.subskill_2` | Puntuacion para desambiguar | 9 |
| `lengua.skill_7.subskill_3` | Segmentacion de oraciones | 9 |

### Subskills huerfanas

No hay subskills huerfanas en el corpus runtime.

### Subskills sobre-representadas

No hay una regla formal de balance, pero la distribucion esta muy concentrada en:

- `lengua.skill_1.subskill_2` - 39 ejercicios.
- `lengua.skill_1.subskill_1` - 20 ejercicios.
- `lengua.skill_1.subskill_3` - 15 ejercicios.

Esto no rompe el sistema, pero sesga la practica hacia comprension/inferencia frente a contenidos nuevos de modulos.

## Consistencia del grafo pedagogico

### Resultado

**Correcto estructuralmente.**

- Nodos en `lengua_mastery_map.json`: 36.
- Relaciones en `lengua_skill_relationships.json`: 38.
- Relaciones hacia nodos inexistentes: 0.
- Skills declaradas en `relationships.skills` inexistentes: 0.
- Subskills declaradas en `relationships.skills[*].subskills` inexistentes: 0.
- `src/data/static_content.ts` esta alineado con el grafo actual: contiene 36 nodos de mastery y las 7 canonical skills.

### Observacion

Las 5 subskills que estaban huerfanas estan integradas en el grafo y ahora tienen ejercicios disponibles para seleccion adaptativa.

## Uso en runtime

### Correcto

- `session_runner.ts`, `simulator_runner.ts` y `exercise_selector.ts` mantienen `skill_id`/`subskill` como IDs internos.
- Los ejercicios legacy `LEN-*` se normalizan hacia skills canonicas.
- El corpus normalizado no produce ejercicios con IDs fuera del mapa.
- La UI relevante transforma IDs a labels mediante `getSkillMetadata(...)`.

### Riesgos de runtime

- `exercise_selector.ts` contiene hardcodes de mapeo legacy y reglas regex hacia IDs canonicos. Es funcional, pero duplica conocimiento que tambien vive en `lengua_mastery_map.json` / `lengua_skill_relationships.json`.
- Las URLs de practica usan IDs tecnicos. No es un leak visual dentro de componentes, pero si queda expuesto en barra de navegador y links.
- `skill_metadata.ts` es un objeto manual separado del mapa pedagogico. Hoy esta completo, pero puede desalinearse si se agregan nuevas subskills sin test de cobertura metadata.
- `npm run build` ejecuta `scripts/build-content-manifest.js` y reescribe `src/data/static_content.ts`; si alguien edita JSON y no corre build/prebuild, el runtime serverless puede quedar desactualizado.

## Problemas encontrados

### UI leaks

No se encontraron IDs tecnicos renderizados como texto en practica, simulador ni dashboard.

Riesgo P2: IDs tecnicos aparecen en URLs (`skill` / `focus` query params). Propuesta: slugs publicos.

### Faltantes en metadata

No hay faltantes.

### Inconsistencias entre mapa y contenido

No quedan subskills canonicas sin ejercicios asociados.

### Problemas en grafo pedagogico

No hay referencias rotas. El problema es de disponibilidad de contenido, no de estructura del grafo.

## Validacion

- `npm run build`: OK.
- `npm run typecheck`: OK despues de `npm run build`.

Nota: una corrida inicial de `npm run typecheck` fallo porque `tsconfig.json` incluye `.next/types/**/*.ts` y esos archivos no existian antes del build. Luego `npm run build` genero `.next/types` y la segunda corrida de `npm run typecheck` paso correctamente.

## Conclusion

El sistema esta **listo a nivel de labels, metadata, grafo, UI renderizada y cobertura semantica minima**.

Confirmaciones:

- UI limpia: si, para texto renderizado en practica, simulador y dashboard.
- Metadata completa: si.
- Grafo pedagogico consistente: si.
- Contenido consistente en IDs: si, no hay ejercicios con subskills inexistentes.
- Cobertura de contenido completa: si, todas las subskills canonicas tienen ejercicios.

Riesgo remanente: decidir si las URLs publicas deben dejar de exponer IDs tecnicos.
