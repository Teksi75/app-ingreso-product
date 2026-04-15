# app-ingreso-product

Sistema de producto para una app EdTech de preparación autónoma para exámenes de ingreso.

El enfoque del producto es:
- entrenamiento por habilidades
- práctica intensiva
- simulaciones de examen
- seguimiento del progreso

⚠️ Este repositorio:
- NO contiene código de la aplicación
- NO utiliza contenido oficial
- NO replica materiales existentes

Su objetivo es definir el sistema completo antes de la implementación.

---

## Sistema de agentes

El producto utiliza un sistema de agentes para validar decisiones antes de avanzar.
El flujo esta gobernado por `agents/orchestrator.md`.
Todas las decisiones pasan por clasificacion, validaciones aplicables y generacion de prompt.
Esto mantiene consistencia, trazabilidad y control de alcance.

---

## 📂 Estructura del repositorio

### /docs
Contiene la definición completa del producto:

- **00_vision** → propósito y alcance del producto  
- **01_research** → insights y análisis  
- **02_pedagogical_model** → cómo aprende el usuario  
- **03_skill_system** → habilidades entrenables (**núcleo del sistema**)  
- **04_exercise_engine** → lógica de ejercicios  
- **05_user_flow** → experiencia del usuario  
- **06_simulator** → simulaciones de examen  
- **07_metrics** → medición de progreso  
- **08_business_rules** → reglas comerciales  
- **09_legal_positioning** → posicionamiento legal y responsabilidad  

---

### /decisions
Registro de decisiones clave del producto (ADR - Architecture Decision Records)

Define:
- qué se decidió
- por qué
- qué implica

---

### /roadmap
Plan de evolución del producto por fases

---

## 🚀 Cómo usar este repositorio

1. Definir o actualizar habilidades en:
   → `docs/03_skill_system/skills_map.md`

2. Diseñar ejercicios en base a habilidades:
   → `docs/04_exercise_engine/`

3. Ajustar experiencia de usuario:
   → `docs/05_user_flow/`

4. Registrar decisiones importantes en:
   → `/decisions`

---

## 🧠 Principio clave

Este producto no enseña contenido.

Entrena habilidades específicas necesarias para resolver evaluaciones.

---

## 📌 Estado

Etapa: definición del sistema (pre-implementación)
