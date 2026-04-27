# Análisis de Sistema de Producto - App Ingreso

> **Última actualización:** Abril 2026  
> **Estado general:** En progreso - Mejora respecto a análisis inicial

---

## 0. Resumen de avances (Abril 2026)

### Problemas resueltos ✅

| Problema original | Estado actual |
|------------------|---------------|
| skills_map_v1 y v2 contradictorios | ✅ Unificado en `docs/03_skill_system/skills_map.md` |
| Documento 00_vision vacío | ✅ `product_vision.md` completo con target, propuesta de valor, diferencial |
| Target de usuarios ambiguo | ✅ Definido: estudiante 11-12 años como usuario, adulto como cliente |
| Criterios de dominio ausentes | ✅ Definidos en skills_map (60%/85%, niveles Inicial/En progreso/Dominado) |
| ADR-001, ADR-003 bien definidos | ✅ Consistentes con la dirección del producto |

### Problemas pendientes ⚠️

| Problema | Prioridad | Estado |
|----------|-----------|--------|
| 01_research y 02_pedagogical_model vacíos | Alta | Sin cambios |
| Contradicción autonomía vs rol del padre | Alta | Sin cambios |
| Modelo comercial sin precio/tiers | Alta | Sin cambios |
| Adaptatividad primitiva | Media | Sin cambios |
| Validación contra examen objetivo | Alta | Sin cambios |
| Proceso de creación de contenido | Alta | Sin cambios |
| Legal real (no solo posicionamiento) | Media | Sin cambios |

**Progreso estimado:** ~40% de los problemas críticos resueltos.

---

## 1. Coherencia general del sistema

### Estado actual

El sistema ha mejorado significativamente. La base conceptual está más sólida, pero persisten vacíos críticos y contradicciones internas que deben resolverse antes de avanzar a implementación.

### Alineación

**Lo que funciona:**
- Los ADR son consistentes entre sí y con el roadmap
- El principio de "entrenamiento vs enseñanza" permea correctamente los documentos operativos
- La estructura general (skills → exercises → simulator → metrics) tiene lógica descendente
- El posicionamiento legal y comercial está alineado y es prudente
- Skills map unificado con 7 habilidades claras y subhabilidades definidas
- Product vision define usuario objetivo (estudiante 11-12) y cliente (adulto)

**Lo que NO funciona:**
- exercise_engine y user_journey tienen redundancias (feedback, adaptatividad)
- 2 de 11 documentos siguen vacíos (01_research, 02_pedagogical_model)
- Contradicción: ADR-003 dice "autonomía total" pero user_journey y business_rules asignan rol activo al padre
- No hay definición de producto mínimo viable ni features priorizadas
- Modelo comercial sin precio, tiers ni condiciones

### Conclusión parcial
Las piezas conceptuales existen y están más integradas. La unificación de skills_map fue el cambio más importante. Sin embargo, persisten contradicciones (autonomía vs padre) y vacíos (research, modelo pedagógico, comercial) que impedirán una implementación limpia.

---

## 2. Evaluación por componente

### Skills Map (v1 y v2)

**Fortalezas:**
- v1 tiene criterios de dominio operativos (60%/85%, velocidad)
- v1 incluye errores comunes (útil para diseñar distractores)
- v2 tiene mejor nomenclatura pedagógica (comprensión literal vs inferencia)

**Debilidades:**
- v1 y v2 son incompatibles entre sí. Usan nombres distintos para habilidades equivalentes. v1 tiene 7 habilidades; v2 tiene 7 pero diferentes. No queda claro cuál es la versión activa.
- Falta evidencia de validación: ¿de dónde salieron estas habilidades? ¿respondieron a un análisis real o a intuición?
- No hay correlación con ningún marco de referencia externo (no se sabe contra qué examen real se valida)
- La subhabilidad "Narrador y punto de vista" en v2 parece innecesariamente específica para un sistema de entrenamiento genérico
- No hay ponderación de habilidades: ¿todasvalen lo mismo? ¿alguna es más crítica?

**Problemas críticos:**
- v2 menciona "tipo de texto" como habilidad pero no queda claro si es entrenable o si es solo información contextual
- La "Expresión Escrita" en v1 requiere producción de texto, pero todo el sistema está diseñado para ejercicios de opción múltiple/correcto-incorrecto. No hay forma de entrenar esto sin intervención humana.

---

### Exercise Engine

**Fortalezas:**
- Distractores diseñados por error común es excelente (reduce opciones aleatorias)
- Estructura de ejercicio clara con campos definidos
- Repetición inteligente con variación es el concepto correcto
- Feedback diferenciado correcto/incorrecto está bienpensado

**Debilidades:**
- No define cómo se genera contenido nuevo (banco estático vs generación procedural)
- La adaptatividad descrita es primitiva: "falló → repetir", "acierto sostenido → subir". No hay algoritmo real.
- No hay definición de dificultad escalable (¿qué hace que un ejercicio sea nivel 1 vs nivel 3?)
- Los 5 tipos de ejercicios son insuficientes para entrenar "Expresión Escrita"
- No hay noción de tiempo por ejercicio como variable de entrenamiento

**Problemas críticos:**
- No hay especificación de cómo el engine selecciona ejercicios (aleatorio, por habilidad faltante, mixto)
- Missing: ¿cómo se evita que el usuario memorize respuestas de ejercicios anteriores?

---

### User Journey

**Fortalezas:**
- Onboarding mínimo es correcto para reducir fricción
- Loop principal está bien definido: practicar → feedback → repetir → simular → progreso
- Sesiones cortas (5-10 min) es apropiado para el target

**Debilidades:**
- Onboarding no establece expectativas ("esto no garantiza resultados")
- La sección de "intervención del padre" contradice el principio de autonomía del ADR-003
- No hay定义 de qué pasa cuando el usuario falla mucho (abandono)
- No hay consideración de motivación intrínseca vs extrínseca
- Falta: ¿el usuario elige qué habilidad entrenar o el sistema decide?

**Problemas críticos:**
- El documento dice que el sistema "propone ejercicios" pero no dice cómo el usuario selecciona habilidades
- No hay path para usuarios que quieren practicar algo específico vs usuarios que quieren seguir el plan del sistema

---

### Simulator

**Fortalezas:**
- Diferenciación clara entre entrenamiento (con feedback) y simulación (sin feedback, con tiempo)
- Scoring por habilidad permite identificar debilidades post-simulación
- Duración razonable (15-25 min)

**Debilidades:**
- No dice cómo se seleccionan los ejercicios del simulador (¿aleatorio? ¿balanceado?)
- No hay noción de "nivel de examen" (¿se simula un examen fácil, medio, difícil?)
- No hay histórico de simulaciones para comparar progreso
- Falta: ¿qué pasa si el usuario reprueba el simulador? ¿se recomienda algo?

**Problemas críticos:**
- La distribución de habilidades en el simulador parece fija ("cada simulador incluye: comprensión literal, inferencia..."). Si el usuario no domina cierta habilidad, ¿debería el simulador forzar esa habilidad o permitir skip?
- No hay correlación entre simulador y habilidades dominadas: ¿un simulador puede weighting las habilidades según el perfil del usuario?

---

### Metrics

**Fortalezas:**
- Métricas claras y accionables
- Distinción entre métricas para usuario vs para padre
- Consistencia como concepto es valioso (evita falsos positivos de "dominio")

**Debilidades:**
- No hay定义 de cómo se calcula exactamente cada métrica
- La "velocidad de respuesta" no tiene threshold definido: ¿qué es "rápido"?
- Métricas para el padre son vagas ("tiempo de uso", "constancia"). ¿Cuánto tiempo es suficiente?
- No hay alerta para detectar cuando el usuario está estancado

**Problemas críticos:**
- Las métricas alimentan la adaptatividad pero no se define el loop completo: ¿cuántos ejercicios necesita el sistema antes de ajustar? ¿qué pasa si hay ruido en los datos?
- Missing: ¿existe una métrica de engagement/retention? ¿cuántas sesiones por semana se espera?

---

### Business Rules

**Fortalezas:**
- Claramente define qué NO es el producto (no tutoría, no garantía)
- Responsabilidad del usuario bien establecida
- Posicionamiento honesto

**Debilidades:**
- No dice nada sobre precio, modelo de suscripción, precios por feature
- No hay definición de tier gratuito vs pago
- No hay política de cancelación,试用期, refund
- El "rol del padre" vuelve a aparecer y contradice autonomía

**Problemas críticos:**
- Se dice "acceso por tiempo" pero no dice duración, precio ni condiciones
- No hay noción de upgrades o extensiones

---

### Legal Positioning

**Fortalezas:**
- Independiente y sin affiliation bien declarado
- Expectativas de resultado controladas
- Lenguaje apropiado

**Debilidades:**
- Es posicionamiento, no términos legales reales
- No hay política de privacidad, manejo de datos de menores
- No hay cláusula de límite de responsabilidad comercial
- No dice qué pasa con los datos si el producto cierra

**Problemas críticos:**
- Para menores de 13/16 años (depende de jurisdicción) se requieren consentimientos parentales específicos bajo GDPR/LOPD. No se menciona.
- El documento dice "los términos legales completos deben desarrollarse a partir de estas definiciones" pero no dice cuándo.

---

## 3. Problemas estructurales

### Duplicaciones (persistentes)

| Contenido | Ubicaciones |
|-----------|-------------|
| Feedback inmediato | exercise_engine, user_journey, metrics |
| Adaptatividad | exercise_engine, user_journey, metrics |
| Rol del padre | user_journey, business_rules, legal_positioning |
| Qué es y qué no es el producto | ADR-001, ADR-003, business_rules, legal_positioning |

### Conceptos mal definidos

1. **Autonomía real**: ADR-003 dice "usuario elige" pero user_journey dice "sistema propone". ¿Quién manda?
2. **Qué significa "dominado"**: Los thresholds (60/85%) son arbitrarios. ¿Hay data que los respalde?
3. **Dificultad de ejercicios**: Se menciona nivel 1-3 pero no qué hace que algo sea difícil.
4. **Contenido original**: Se dice que es "original" pero no hay metodología de creación definida.
5. **Target real**: Resuelto parcialmente - ahora hay claridad (usuario=estudiante, cliente=adulto) pero falta validar con research.

### Vacíos importantes (persistentes)

1. ~~No hay análisis competitivo real~~ → Pendiente (sin cambios)
2. ~~No hay validación de habilidades~~ → Pendiente (sin cambios)
3. ~~No hay proceso de creación de contenido~~ → Pendiente (sin cambios)
4. No hay noción de gamificación, streaks, badges (aceptable para MVP)
5. No hay consideración de offline, sync, multi-device (aceptable para MVP)
6. No hay definición de qué pasa si el usuario quiere dejar de usar la app
7. No hay strategy de onboarding para distintos tipos de usuario

### Partes que no escalan

1. **skills_map**: Con 7 habilidades + subhabilidades, si se agregan más el sistema se fragmenta. Validar que estas 7 son suficientes.
2. **exercise_engine**: Con 5 tipos de ejercicios no se puede entrenar "Expresión Escrita". Aceptable si se limita el scope a comprensión lectora.
3. **Modelo de contenido**: Si todo es "original", la creación de contenido no escala sin proceso industrial definido.

---

## 3.1. Propuestas de solución para problemas críticos

### A. Contradicción autonomía vs rol del padre

**Problema:** ADR-003 dice autonomía total, pero user_journey sección 8 y business_rules asignan rol activo al padre ("supervisar uso", "asegurar constancia").

**Análisis:** Ambos son legítimos pero para usuarios diferentes:
- El estudiante (11-12) debería tener autonomía en la práctica
- El padre debería tener visibilidad del progreso y herramientas de control

**Solución propuesta:**
1. Separar claramente "UX del estudiante" vs "UX del padre"
2. El padre NO debe intervenir en el flujo de práctica del estudiante
3. El padre tiene su propia vista: dashboard de progreso, configuración de límites de tiempo
4. La separación de roles ya está resuelta: ADR-003 (autonomía del estudiante), ADR-004 (responsabilidad del padre) y ADR-006 (identidad de progreso anónima)

**Acción requerida:**
- Verificar que user_journey y business_rules reflejen la separación ya definida en ADR-003/004/006

---

### B. Documentos vacíos: research y modelo pedagógico

**Problema:** 01_research y 02_pedagogical_model siguen como "borrador inicial" (3 líneas).

**Solución propuesta:**

**Para 01_research:**
- Agregar análisis competitivo: ¿qué existe hoy para estos exámenes?
- Agregar user persona del estudiante (11-12): cómo practica, qué le frustra
- Agregar user persona del padre: qué busca, qué teme, cuánto está dispuesto a pagar
- Validar si el examen objetivo está públicamente disponible o si se necesita acceso

**Para 02_pedagogical_model:**
- Fundamentar por qué la práctica repetitiva funciona (ciencia del aprendizaje)
- Citar fuentes: spaced repetition, cognitive load theory, deliberate practice
- Definir cómo se traducen estos principios al diseño del producto
- Especificar limitaciones: qué NO puede lograr este enfoque

**Acción requerida:**
- Prioridad media: no bloquea implementación pero sí validación del enfoque

---

### C. Modelo comercial ausente

**Problema:** business_rules dice "acceso por tiempo" pero sin precio, tiers, ni condiciones.

**Solución propuesta:**

Definir 3 tiers:

| Tier | Nombre | Precio sugerido | Contenido |
|------|--------|----------------|-----------|
| Free | Diagnóstico | $0 | 1 diagnóstico, 5 ejercicios/habilidad, sin simulador |
| Basic | Mensual | $9.99/mes | Ejercicios ilimitados, 1 simulación/semana, métricas básicas |
| Pro | Mensual | $19.99/mes | Todo + simulaciones ilimitadas, métricas avanzadas, dashboard padre |

**Acción requerida:**
- Definir precios reales basados en costos y mercado
- Diseñar flujo de upgrade desde Free a Basic/Pro
- Definir política de cancelacón y refund (mínimo 7 días)

---

### D. Validación contra examen objetivo

**Problema:** Las 7 habilidades no están validadas contra el examen real que el usuario quiere aprobar.

**Solución propuesta:**

1. **Si el examen tiene estructura pública:** Mapear cada habilidad del skills_map contra las secciones del examen. Documentar qué habilidades corresponden a qué parte del examen.

2. **Si el examen NO tiene estructura pública:**
   - Usar técnicas de reverse-engineering: analizar exams anteriores si existen
   - Validar con usuarios que ya tomaron el examen: ¿las habilidades que entrenamos aparecen en el examen?
   - Crear hipótesis y testear con datos reales post-lanzamiento

3. **Crear matriz de trazabilidad:**

| Habilidad | Examen sección | Preguntas tipo | Importancia |
|-----------|---------------|----------------|-------------|
| Comprensión literal | ¿? | ¿? | Crítica |
| Inferencia | ¿? | ¿? | Crítica |
| ... | ... | ... | ... |

**Acción requerida:**
- Alta prioridad - sin esto el entrenamiento podría ser irrelevante
- Requiere acceso al examen o a informantes que lo conozcan

---

### E. Proceso de creación de contenido

**Problema:** No hay metodología definida para crear ejercicios nuevos. "Original" no es suficiente.

**Solución propuesta:**

1. **Definir el proceso de creación de un ejercicio:**

```
Idea → Draft → Validación pedagógica → Revisión de errores comunes 
→ Test con usuario → Aprobación → Banco de ejercicios
```

2. **Roles:**
   - Pedagogo: valida que el ejercicio mide lo que dice medir
   - Editor: revisa claridad de consigna, opciones, distractores
   - Usuario beta: testea que el ejercicio es comprensible

3. **Criterios de calidad de un ejercicio:**
   - Mide una habilidad específica (no mezcladas)
   - Distractores representan errores reales (no aleatorios)
   - Consigna sin ambigüedad
   - Respuesta correcta objetivamente verificable
   - Para opción múltiple: 4 opciones, 1 correcta, 3 distractores plausibles

4. **Banco de ejercicios vs generación procedural:**
   - Para MVP: banco estático de ejercicios (100-200 por habilidad)
   - Fase 2: generación procedural controlada (misma estructura, contenido variable)
   - Fase 3: IA generativa (futuro)

**Acción requerida:**
- Prioridad alta - sin ejercicios el producto no existe
- Empezar con 20-30 ejercicios por habilidad para tener MVP funcional

---

## 4. Riesgos del producto

---

## 4. Riesgos del producto

### Riesgos pedagógicos

- **Riesgo**: Las habilidades definidas no corresponden a lo que realmente evalúa el examen objetivo.
  - Impacto: Entrenamiento irrelevante. Usuario Practica pero no mejora en el examen real.
  - Mitigación: Validar skills contra exams reales o gegenbeis.

- **Riesgo**: El modelo de "repetición intensiva" puede generar fatiga y abandono.
  - Impacto: Alta tasa de abandono post-diagnóstico.
  - Mitigación: No definida.

- **Riesgo**: Dominio medido solo por % de aciertos + velocidad no captura comprensión real.
  - Impacto: Falso sentido de preparación.
  - Mitigación: No definida.

### Riesgos de UX

- **Riesgo**: Sin objetivos claros por sesión, el usuario no sabe qué logró.
  - Impacto: Abandono por falta de progres visible.
  - Mitigación: parcial en metrics.

- **Riesgo**: La falta de Path personal (elegir habilidad) frustra usuarios con objetivo específico.
  - Impacto: Pérdida de usuarios que quieren ir directo a su debilidad.
  - Mitigación: No definida.

- **Riesgo**: Intervención del padre (sección 8 de user_journey) puede generar conflict child-parent sobre uso.
  - Impacto: Rechazo del usuario (adolescente) hacia la app.
  - Mitigación: No definida.

### Riesgos comerciales

- **Riesgo**: Usuario no ve resultado en examen real y pide reembolso.
  - Impacto: Pérdida financiera + reputacional.
  - Mitigación: Disclaimers en legal pero no hay política de refund.

- **Riesgo**: Producto "autónomo" sin resultados visibles no retiene usuarios.
  - Impacto: Churn alto, revenue insostenible.
  - Mitigación: No hay strategy de retention definida.

- **Riesgo**: Dependencia de creación de contenido propio sin proceso definido.
  - Impacto: Contenido se agota, producto se estanca.
  - Mitigación: No definida.

### Riesgos legales

- **Riesgo**: Recopilación de datos de menores sin consentimiento parental adecuado.
  - Impacto: Multas bajo GDPR/LOPD.
  - Mitigación: Legal positioning menciona menores pero no dice cómo handled.

- **Riesgo**:claim de mejora de habilidades sin evidencia científica.
  - Impacto: Acciones por publicidad engañosa.
  - Mitigación: Disclaimers en legal, pero pueden no ser suficientes.

---

## 5. Nivel del producto

**Clasificación: BÁSICO → EN DESARROLLO**

### Justificación

El sistema ha avanzado de "boceto" a "diseño en progreso". Los conceptos centrales están más definidos y hay coherencia entre documentos. Sin embargo, persisten vacíos críticos.

Evidencia:

| Dimensión | Estado anterior | Estado actual |
|-----------|-----------------|---------------|
| Visión de producto | Vacía | ✅ Completa |
| Research | Vacío | ⚠️ Borrador (3 líneas) |
| Modelo pedagógico | Vacío | ⚠️ Borrador (3 líneas) |
| Skills validados | No (2 versiones) | ✅ Unificado (v2) |
| Motor de ejercicios | Conceptual | ✅ Estructura definida, falta algoritmo |
| Adaptatividad | Reglas if-then | ⚠️ Sin cambios |
| Métricas | Nombres, sin cálculo | ⚠️ Sin cambios |
| Modelo comercial | Principos, sin precio | ⚠️ Sin cambios |
| Legal | Posicionamiento | ⚠️ Sin cambios |
| Scaling plan | No hay | ✅ Roadmap existe |

**Lo que existe ahora es un diseño de producto funcional, no un boceto.**

Para avanzar a implementación necesita:
- Llenar los 2 documentos vacíos (research, modelo pedagógico) - no bloqueante pero recomendado
- Resolver la contradicción autonomía vs rol del padre - bloqueante
- Definir modelo comercial básico - bloqueante para lanzar
- Validar skills contra examen objetivo - bloqueante para éxito del producto

---

## 6. Recomendaciones actualizadas (Abril 2026)

### Prioridad Alta - Bloqueantes

**1. Resolver contradicción autonomía vs rol del padre** ⭐ RESUELTO
- ADR-003 define autonomía del estudiante, ADR-004 define responsabilidad del padre, ADR-006 define identidad anónima
- No requiere ADR nuevo; la concern está cubierta por estos tres ADRs conjuntamente

**2. Validar skills contra el examen objetivo** ⭐
- Mapear las 7 habilidades a las secciones del examen real
- Crear matriz de trazabilidad (ver sección 3.1.D)
- Sin esto, el entrenamiento podría ser irrelevante

**3. Definir proceso de creación de contenido** ⭐
- Diseñar workflow de creación de ejercicios (idea → draft → validación → aprobación)
- Empezar con banco estático (100-200 ejercicios por habilidad)
- Ver sección 3.1.E para propuesta detallada

**4. Definir modelo comercial básico** ⭐ NUEVO
- Diseñar tiers Free/Basic/Pro con precios
- Definir política de cancelación y refund
- Ver propuesta en sección 3.1.C

### Prioridad Media - Recomendados

**5. Llenar documentos vacíos (01_research, 02_pedagogical_model)** ⭐ NUEVO
- Ya no están vacíos conceptualmente pero sí en contenido
- Research: análisis competitivo, user personas, validación de examen
- Modelo pedagógico: fundamentación científica de spaced repetition y deliberate practice

**6. Diseñar el loop de adaptatividad completo**
- Definir: ¿cuántos ejercicios antes de cambiar? ¿cómo se detecta que funcionó?
- Parámetros sugeridos: 5 ejercicios por habilidad antes de re-evaluar

**7. Definir métricas de retention**
- ¿Cuántas sesiones/semana son el objetivo?
- ¿Qué pasa cuando el usuario no vuelve? (re-engagement)

**8. Desarrollar términos legales reales**
- Política de privacidad (crítico para menores)
- Términos de uso
- Consentimiento parental (GDPR/LOPD)

### Prioridad Baja (después de MVP)

- Gamificación (streaks, badges)
- Dashboard de padre expandido
- Multi-device / offline
- Nuevas habilidades

---

## 7. Checklist de pre-lanzamiento

### Lo que ya está listo ✅

- [x] Marco conceptual general (entrenamiento vs enseñanza, skills, feedback inmediato)
- [x] ADR consistentes que definen alcance y limitaciones
- [x] Roadmap con fases lógicas de evolución
- [x] Posicionamiento legal y comercial sensato
- [x] Product vision completa (target, propuesta de valor, diferencial)
- [x] Skills unificado (7 habilidades con subhabilidades, criterios de dominio)
- [x] Exercise engine con tipos de ejercicios y estructura definida
- [x] User journey con flujo principal

### Qué falta antes de poder construir (bloqueantes) ⚠️

- [x] **Resolver contradicción autonomía vs rol del padre** (ADR-003 + ADR-004 + ADR-006)
- [ ] **Validar skills contra examen objetivo** (matriz de trazabilidad)
- [ ] **Definir proceso de creación de contenido** (workflow de ejercicios)
- [ ] **Definir modelo comercial** (tiers, precios, refund)
- [ ] **Llenar 01_research** (análisis competitivo, user personas)
- [ ] **Llenar 02_pedagogical_model** (fundamentación científica)

### Qué falta antes de lanzar comercialmente ⚠️

- [ ] Términos legales reales (política de privacidad, términos de uso)
- [ ] Consentimiento parental para menores (GDPR/LOPD compliance)
- [ ] Integración de pagos (si se cobra)
- [ ] Dashboard de padre funcional

### Secuencia sugerida para completar

```
1. ~~Crear ADR-005 (modelo de roles)~~ → RESUELTO por ADR-003 + ADR-004 + ADR-006
2. Llenar 01_research y 02_pedagogical_model - semana 1
3. Validar skills contra examen + crear proceso de contenido - semana 2
4. Definir modelo comercial (tiers, precios) - semana 3
5. Desarrollar términos legales reales - semana 4
6. CON LO ANTERIOR: empezar a construir MVP técnico
```

**Nota:** Las secciones 3.1.A a 3.1.E tienen propuestas detalladas para cada problema crítico.

---

## Resumen

El producto ha evolucionado de "brief de producto" a "diseño en progreso". Los cambios más importantes fueron:
- Unificación de skills_map (eliminando contradicciones v1/v2)
- Product vision completa
- Definición clara del usuario objetivo

**Lo que se logró (~40% de problemas críticos):**
- ✅ Sistema de skills unificado con 7 habilidades
- ✅ Product vision y posicionamiento definidos
- ✅ ADR consistentes y roadmap claro
- ✅ Exercise engine con estructura definida

**Lo que falta (~60% de problemas críticos):**
- ⚠️ Contradicción autonomía vs rol del padre (bloqueante)
- ⚠️ Validación contra examen objetivo (bloqueante)
- ⚠️ Proceso de creación de contenido (bloqueante)
- ⚠️ Modelo comercial (bloqueante para lanzar)
- ⚠️ Research y modelo pedagógico vacíos
- ⚠️ Legal real (no solo posicionamiento)

**Estado actual:** Diseño de producto funcional, listo pararesolver bloqueantes antes de implementar.

Las propuestas de solución detalladas están en la sección 3.1 (A-E).
