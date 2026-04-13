# Análisis de Sistema de Producto - App Ingreso

## 1. Coherencia general del sistema

### Estado

El sistema tiene una base sólida pero está incompleto y tiene contradicciones internas que deben resolverse antes de avanzar a implementación.

### Alineación

**Lo que funciona:**
- Los ADR son consistentes entre sí y con el roadmap
- El principio de "entrenamiento vs enseñanza" permea correctamente los documentos operativos
- La estructura general (skills → exercises → simulator → metrics) tiene lógica descendente
- El posicionamiento legal y comercial está alineado y es prudente

**Lo que NO funciona:**
- skills_map_v1 y skills_map_v2 son versiones contradictorias, no complementarias
- 4 de 11 documentos están vacíos (00_vision, 01_research, 02_pedagogical_model)
- exercise_engine y user_journey tienen redundancias (feedback, adaptatividad)
- El target de usuarios es ambiguo: ¿adolescentes de 11-12 años o "usuarios adultos"? (ver ADR-004 vs user_journey sección 8)
- No hay definición de producto mínimo viable ni features priorizadas

### Conclusión parcial
Las piezas conceptuales existen pero no forman un sistema integrado. Hay duplicación, vacíos y contradicciones que impedirán una implementación limpia.

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

### Duplicaciones

| Contenido | Ubicaciones |
|-----------|-------------|
| Feedback inmediato | exercise_engine, user_journey, metrics |
| Adaptatividad | exercise_engine, user_journey, metrics |
| Rol del padre | user_journey, business_rules, legal_positioning |
| Qué es y qué no es el producto | ADR-001, ADR-003, business_rules, legal_positioning |
| Criterios de dominio | skills_map_v1, skills_map_v2 |

### Conceptos mal definidos

1. **Autonomía real**: Se dice que el usuario elige pero el sistema "propone". ¿Quién manda?
2. **Qué significa "dominado"**: Los thresholds (60/85%) son arbitrarios. ¿Hay data que los respalde?
3. **Dificultad de ejercicios**: Se menciona nivel 1-3 pero no qué hace que algo sea difícil.
4. **Contenido original**: Se dice que es "original" pero no hay metodología de creación definida.
5. **Target real**: ¿11-12 años? ¿usuarios adultos? ¿padres que compran para hijos?

### Vacíos importantes

1. No hay análisis competitivo real (solo se asume que no hay otro igual)
2. No hay validación de que las habilidades elegidas corresponden al examen objetivo
3. No hay definición de cómo se crea contenido nuevo (banco de ejercicios, creación, curación)
4. No hay noción de gamificación, streaks, badges,激励机制
5. No hay consideración de offline, sync, multi-device
6. No hay定義 de qué pasa si el usuario quiere dejar de usar la app
7. No hay strategy de onboarding para distintos tipos de usuario

### Partes que no escalan

1. **skills_map_v2**: Si se agregan más habilidades como "Narrador y punto de vista", el sistema se fragmenta
2. **exercise_engine**: Con 5 tipos de ejercicios no se puede entrenar todo; limitante para escala
3. **Modelo de contenido**: Si todo es "original", la creación de contenido no escala sin proceso industrial

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

**Clasificación: BÁSICO**

### Justificación

El sistema tiene conceptos correctos pero incompletos. Está en etapa de "boceto de producto", no de diseño de producto.

Evidencia:

| Dimensión | Estado |
|-----------|--------|
| Visión de producto | Vacía (00_vision) |
| Research | Vacío (01_research) |
| Modelo pedagógico | Vacío (02_pedagogical_model) |
| Skills validados | No (2 versiones contradictorias) |
| Motor de ejercicios | Conceptual, sin algoritmo |
| Adaptatividad | Reglas if-then, sin lógica robusta |
| Métricas | Nombres, sin cálculo definido |
| Modelo comercial | Principos, sin precio ni tiers |
| Legal | Posicionamiento, no términos |
| Scaling plan | No hay |

Lo que existe es un buen brief de producto, no un sistema de producto.

---

## 6. Recomendaciones concretas

### Prioridad Alta

**1. Eliminar skills_map_v2 y fijar v1 como oficial (o fusionar)**
Dos versiones = ninguna versión. Decidir una y documentar por qué se eligió.

**2. Validar skills contra el examen objetivo**
Definir: ¿qué examen? ¿se tiene acceso a su estructura? ¿las habilidades cubren lo que ese examen evalúa?

**3. Definir la estructura de contenido**
¿Cómo se crean ejercicios? ¿Quién los crea? ¿Cómo se valida que son buenos? Sin esto, el producto no escala.

**4. Escribir product_vision**
Sin visión no hay dirección. Minimum: target, problema que resuelve, propuesta de valor, diferencia.

**5. Definir modelo de usuario (quién usa realmente)**
¿El usuario es el adolescente de 11-12 años o el padre que compra? Esto cambia onboarding, UX, legal y pricing.

### Prioridad Media

**6. Diseñar el loop de adaptatividad completo**
El documento actual dice "falló → repetir" pero no dice: ¿cuántos ejercicios antes de cambiar? ¿cómo se detecta que el cambio funcionó?

**7. Definir métricas de retention**
¿Cuántas sesiones/semana son el objetivo? ¿Qué pasa cuando el usuario no vuelve? Sin esto no hay forma de medir si el producto funciona.

**8. Escribir modelo pedagógico real**
"No enseña, solo entrena" es un principio, no un modelo. Necesita fundamentación: ¿por qué funciona la práctica repetitiva? ¿qué dice la ciencia del aprendizaje?

**9. Desglosar business_rules en modelo comercial**
Precio, tiers, períodos de facturación, refund policy. Los principios no son suficientes.

**10. Desarrollar términos legales reales**
El positioning actual no protege legalmente. Necesita política de privacidad, términos de uso, y handling de menores.

### Prioridad Baja (después de tener lo anterior)

- Gamificación (streaks, badges)
- Dashboard de padre expandido
- Multi-device / offline
- Nuevas habilidades

---

## 7. Antes de construir product_vision

### Qué está listo

- Marco conceptual general (entrenamiento vs enseñanza, skills, feedback inmediato)
- ADR consistentes que definen alcance y limitaciones
- Roadmap con fases lógicas de evolución
- Posicionamiento legal y comercial sensato

### Qué falta definir

1. **Visión**: Vacía
2. **Research**: Vacío (no hay análisis de mercado, usuario, ni competitivo)
3. **Modelo pedagógico**: Vacío (no hay fundamentación de por qué esto funciona)
4. **Skills oficial**: Dos versiones contradictorias
5. **Contenido**: No hay método de creación de ejercicios
6. **Usuario real**: Ambigüedad entre target demográfico

### Qué debería corregirse antes de avanzar

1. **skills_map**: Elegir UNA versión. Si v1 y v2 tienen elementos útiles, fusionar en una tercera versión coherente.
2. **Target de usuario**: Definir si el producto es para el estudiante (11-12 años) o para el padre que compra. No puede ser ambos con la misma UX.
3. **Creación de contenido**: Definir el proceso antes debuild engine. Si no hay forma de generar ejercicios, el engine no tiene sentido.
4. **Legal + menores**: Decidir cómo se handled datos de menores de forma legalmente compliant.
5. **Métricas de negocio**: Definir qué significa "éxito" en números (usuarios, retention, revenue).

### Secuencia sugerida

1. Validar skills contra examen objetivo
2. Definir target de usuario y buyer persona
3. Definir proceso de creación de contenido
4. Escribir product_vision y modelo pedagógico
5. Desarrollar legal real (no solo posicionamiento)
6. Diseñar modelo comercial concreto
7. Con lo anterior: unificar skills_map en una versión

---

## Resumen

El repositorio tiene bones mimbres de un sistema de producto EdTech. Los conceptos centrales (skills, práctica intensiva, feedback, simulaciones) están bien pensados y son coherentes entre sí.

Sin embargo, está incompleto en lo esencial:
- 4 de 11 documentos vacíos
- Skills duplicados en dos versiones incompatibles
- Sin validación contra el examen objetivo
- Sin proceso de creación de contenido
- Legal y comercial en modo "posicionamiento" no en modo "operativo"

**El sistema está en etapa de brief de producto, no de diseño de producto.**

Para avanzar a implementación necesita: definir target, validar skills, crear proceso de contenido, y convertir documentos conceptuales en documentos operativos.
