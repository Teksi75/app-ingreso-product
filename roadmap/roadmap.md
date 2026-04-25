# Product Roadmap - App Ingreso

Estado actualizado: 2026-04-25.

## Estado actual

El producto ya supero la etapa de UI estática. Hoy tiene un MVP funcional de Lengua:

- práctica standalone por skill/subskill;
- sesiones reading-based con texto base canónico;
- simulador de Lengua con bloques de lectura y ejercicios standalone;
- progreso local persistido;
- modelo de mastery por skill/subskill;
- recomendación canónica de siguiente paso;
- URLs públicas con slugs y compatibilidad con IDs técnicos legacy;
- tests unitarios de recomendación y E2E de flujos principales.

Matemática, backend, cuentas, pagos y persistencia remota siguen fuera del corto plazo.

---

## Fase A - Estabilización técnica y trazabilidad

Objetivo: mantener el estado verde y la documentación/grafo alineados con el código.

- Ejecutar antes de cerrar cambios: `npm run test:unit`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
- Actualizar `graphify-out/` después de cambios relevantes.
- Mantener `README.md`, `docs/continuar-pc-trabajo.md` y `docs/analysis/*` sincronizados.
- Agregar tests unitarios para `skill_slugs.ts`.

Resultado esperado:
→ El proyecto queda retomable desde cualquier PC sin reconstruir contexto.

---

## Fase B - Cierre de navegación pública

Objetivo: que la experiencia no exponga IDs técnicos y que las URLs sean estables.

- Mantener links nuevos con slugs para skills y reading units.
- Mantener soporte legacy para `lengua.skill_*` y `RU-LEN-*`.
- Cubrir slugs con unit tests y E2E.
- Evaluar si los slugs de reading units deben fijarse manualmente en vez de derivarse del título.

Resultado esperado:
→ Navegación pública clara, testeada y compatible hacia atrás.

---

## Fase C - Cobertura pedagógica y simulador

Objetivo: reducir sesgos de contenido y asegurar que todas las skills canónicas entren al simulador.

- Verificar por test que `lengua.skill_3` puede aparecer en sesiones de simulador.
- Ampliar reading units para cubrir mejor skill 3, skill 5 y skill 7.
- Crear una reading unit nueva que cruce escritura clara + uso de verbos.
- Regenerar `src/data/static_content.ts` con `npm run build` o `npm run prebuild`.
- Auditar dificultad, glosario y feedback de nuevos contenidos.

Resultado esperado:
→ Simulador y práctica reflejan mejor el mapa de skills, no solo comprensión global.

---

## Fase D - Reporte para padres

Objetivo: convertir el bloque de reporte en una vista útil sin introducir datos sensibles.

- Métricas agregadas: días activos, ejercicios, precisión global.
- Progreso por skill con labels legibles.
- Siguiente paso recomendado en lenguaje general.
- Evitar claims de mejora garantizada o referencias oficiales.

Resultado esperado:
→ Vista de seguimiento simple y prudente para adultos responsables.

---

## Futuro

- Backend y persistencia real.
- Cuentas/autenticación.
- Pagos o acceso comercial.
- Módulo de Matemática.
