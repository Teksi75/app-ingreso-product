# Product Roadmap - App Ingreso

Estado actualizado: 2026-04-25.

## Estado actual

MVP funcional de Lengua con identidad de progreso anónima y separación clara de la futura capa de licencias:

- práctica standalone por skill/subskill;
- sesiones reading-based con texto base canónico;
- simulador de Lengua con bloques de lectura y ejercicios standalone;
- progreso persistido por código de estudiante (Redis `progress:{code}` o `data/progress_{code}.json`);
- cookie `teksi75_progress` auto-generada vía middleware;
- modelo de mastery por skill/subskill;
- recomendación canónica de siguiente paso;
- URLs públicas con slugs y compatibilidad con IDs técnicos legacy;
- dashboard con código de progreso, reset por alumno y link al reporte familiar;
- `/reporte?code=...` público de solo lectura para familias;
- `/reporte/datos?code=...` para descarga JSON;
- tests unitarios de recomendación, skill_slugs y E2E de flujos principales;
- ADR-006: separación progreso / licencia futura por cohorte.

Matemática, backend, cuentas, pagos y licencias comerciales siguen fuera del corto plazo.

---

## Fase A - Estabilización técnica y trazabilidad

Objetivo: mantener el estado verde y la documentación/grafo alineados con el código.

- [x] Agregar tests unitarios para `skill_slugs.ts`.
- [ ] Ejecutar antes de cerrar cambios: `npm run test:unit`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
- [ ] Actualizar `graphify-out/` después de cambios relevantes.
- [ ] Mantener `README.md` y `docs/analysis/*` sincronizados con la arquitectura actual (middleware, student_identity, reporte).

Resultado esperado:
→ El proyecto queda retomable desde cualquier PC sin reconstruir contexto.

---

## Fase B - Cierre de navegación pública

Objetivo: que la experiencia no exponga IDs técnicos y que las URLs sean estables.

- [x] Mantener links nuevos con slugs para skills y reading units.
- [x] Mantener soporte legacy para `lengua.skill_*` y `RU-LEN-*`.
- [x] Cubrir slugs con unit tests y E2E.
- [ ] Fijar slugs de reading units manualmente (mapa `READING_UNIT_SLUGS`) en vez de derivarlos del título con `slugify()`.

Resultado esperado:
→ Navegación pública clara, testeada y compatible hacia atrás.

---

## Fase C - Cobertura pedagógica y simulador

Objetivo: reducir sesgos de contenido y asegurar que todas las skills canónicas entren al simulador.

- [x] Verificar por test que `lengua.skill_3` puede aparecer en sesiones de simulador.
- [ ] Ampliar reading units para cubrir mejor skill 3, skill 5 y skill 7.
- [ ] Crear una reading unit nueva que cruce escritura clara + uso de verbos.
- [ ] Regenerar `src/data/static_content.ts` con `npm run build` o `npm run prebuild`.
- [ ] Auditar dificultad, glosario y feedback de nuevos contenidos.

Resultado esperado:
→ Simulador y práctica reflejan mejor el mapa de skills, no solo comprensión global.

---

## Fase D - Reporte para padres ✅

Objetivo: convertir el bloque de reporte en una vista útil sin introducir datos sensibles.

- [x] Métricas agregadas: días activos, ejercicios, precisión global.
- [x] Progreso por skill con labels legibles.
- [x] Vista de solo lectura en `/reporte?code=...` y descarga JSON en `/reporte/datos?code=...`.
- [x] Recomendación en lenguaje general, sin claims de mejora garantizada ni referencias oficiales.
- [x] Mailto con resumen para compartir sin exponer datos personales.

---

## Futuro

- Backend y persistencia real.
- Cuentas/autenticación.
- Licencias comerciales por cohorte (ADR-006).
- Módulo de Matemática.
