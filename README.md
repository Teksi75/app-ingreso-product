# App Ingreso

Sistema de entrenamiento autónomo para estudiantes que se preparan para exámenes de ingreso.

> **No enseña contenido. Entrena habilidades.**

---

## 🎯 Propósito

App Ingreso es una plataforma de práctica intensiva que ayuda a estudiantes de 11-12 años a mejorar su rendimiento en evaluaciones de ingreso mediante:

- **Entrenamiento por habilidades** - Ejercicios focalizados en competencias específicas
- **Práctica intensiva** - Sesiones cortas y repetitivas con feedback inmediato
- **Simulaciones de examen** - Práctica en condiciones reales de tiempo
- **Seguimiento del progreso** - Visualización del avance por habilidad

---

## ⚠️ Descargo de responsabilidad

Este producto:
- **NO** utiliza contenido oficial de exámenes
- **NO** replica materiales de academias existentes
- **NO** garantiza resultados específicos
- **NO** reemplaza el estudio académico

Su objetivo es maximizar la probabilidad de mejora mediante práctica sistemática.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) 14+ (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Almacenamiento**: JSON local (mvp)

---

## 📂 Estructura del Repositorio

### `/src` - Código Fuente
Implementación funcional del producto:

```
src/
├── app/                    # Páginas de Next.js
│   ├── dashboard/         # Panel principal de habilidades
│   ├── practice/          # Pantalla de práctica de ejercicios
│   ├── layout.tsx         # Layout raíz de la aplicación
│   └── globals.css        # Estilos globales
├── components/            # Componentes React reutilizables
│   └── dashboard/         # Componentes del panel (Header, SkillList, etc.)
├── practice/              # Lógica de negocio del sistema de práctica
│   ├── exercise_selector.ts      # Algoritmo de selección adaptativa
│   ├── session_runner.ts         # Gestor de sesiones de práctica
│   ├── simulator_runner.ts       # Simulador de examen con tiempo
│   └── exercise_selector.test.ts # Tests del selector
└── storage/
    └── local_progress_store.ts   # Persistencia de progreso en JSON
```

### `/docs` - Definición del Producto
Documentación completa del sistema:

| Carpeta | Contenido |
|---------|-----------|
| `00_vision/` | Propósito y alcance del producto |
| `01_research/` | Insights y análisis de usuarios |
| `02_pedagogical_model/` | Modelo de aprendizaje aplicado |
| `03_skill_system/` | **Sistema de habilidades** - núcleo del producto |
| `04_exercise_engine/` | Lógica de ejercicios y selección |
| `05_user_flow/` | Flujos de usuario y experiencia |
| `06_simulator/` | Especificaciones del simulador de examen |
| `07_metrics/` | Sistema de medición de progreso |
| `08_business_rules/` | Reglas comerciales |
| `09_legal_positioning/` | Posicionamiento legal |

### `/agents` - Sistema de Agentes
Protocolos y definiciones para validación de decisiones:

- `orchestrator.md` - Flujo principal de validación
- `definitions/` - Definición de cada agente (Product Guardian, Scope Validator, etc.)
- `protocols/` - Protocolos de interacción
- `prompts/` - Prompts especializados para agentes
- `examples/` - Ejemplos de casos de uso

### `/decisions` - Registro de Decisiones (ADR)
Architecture Decision Records que documentan:
- Qué se decidió
- Por qué se decidió
- Qué implica

### `/roadmap` - Plan de Evolución
Fases del desarrollo del producto desde MVP hasta escala.

### `/data` - Datos de Ejemplo
Progreso de usuario de ejemplo para desarrollo.

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos previos
- Node.js 18+
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd app-ingreso-product

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Ejecutar Tests

```bash
npm test
```

---

## 📋 Flujo de Trabajo del Producto

### 1. Definir o actualizar habilidades
→ `docs/03_skill_system/skills_map.md`

### 2. Diseñar ejercicios basados en habilidades
→ `docs/04_exercise_engine/`

### 3. Implementar funcionalidades
→ `/src/practice/` para lógica de negocio
→ `/src/components/` para UI

### 4. Registrar decisiones importantes
→ `/decisions/`

### 5. Validar mediante sistema de agentes
→ Seguir protocolo en `agents/orchestrator.md`

---

## ✅ Funcionalidades Implementadas

### Dashboard
- [x] Visualización de habilidades por módulo
- [x] Indicadores de nivel y progreso
- [x] Acceso rápido a práctica y simulador

### Sistema de Práctica
- [x] Selector de ejercicios adaptativo con 4 reglas de prioridad
- [x] Sesiones de 10 ejercicios con seguimiento
- [x] Feedback inmediato por respuesta
- [x] Adaptación automática según rendimiento

### Simulador de Examen
- [x] Modo examen con tiempo limitado
- [x] Preguntas de todas las habilidades
- [x] Resultados y análisis post-simulación

### Almacenamiento
- [x] Persistencia local de progreso
- [x] Seguimiento de nivel por habilidad
- [x] Historial de sesiones

---

## 🧠 Principios del Producto

1. **El aprendizaje ocurre por práctica, no por explicación**
2. **Cada ejercicio debe tener un objetivo de habilidad claro**
3. **El feedback debe ser inmediato y específico**
4. **La dificultad se adapta al nivel del usuario**
5. **La práctica debe ser constante, no extensa**

---

## 📌 Estado del Proyecto

**Fase**: Implementación MVP en progreso

- ✅ Definición del sistema completada
- ✅ Arquitectura base implementada
- ✅ Sistema de práctica funcional
- ✅ Dashboard operativo
- 🔄 Contenido de ejercicios en expansión
- ⏳ Analytics avanzados (próximamente)

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.
