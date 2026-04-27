# INGENIUM - Preparación para Ingreso al Secundario

Plataforma educativa gamificada para preparar el ingreso al secundario. Diseñada para estudiantes de 11-13 años con enfoque en **Matemática** y **Lengua**.

> **No enseña contenido. Entrena habilidades.**

---

## 🎯 Propósito

INGENIUM es una plataforma de práctica intensiva que ayuda a estudiantes a mejorar su rendimiento en evaluaciones de ingreso mediante:

- **Entrenamiento por habilidades** - Ejercicios focalizados en Matemática y Lengua
- **Práctica intensiva** - Sesiones cortas y repetitivas con feedback inmediato
- **Simulaciones de examen** - Práctica en condiciones reales de tiempo
- **Gamificación** - Sistema de niveles, XP, logros y rachas
- **Seguimiento del progreso** - Visualización del avance por materia

---

## ✨ Características Principales

### 🎮 Gamificación
- Sistema de niveles y experiencia (XP)
- Racha diaria de estudio
- Logros y badges desbloqueables
- Avatar personalizable
- Barra de progreso visual

### 📚 Materias
- **Matemática**: Aritmética, fracciones, geometría, proporciones
- **Lengua**: Comprensión lectora, gramática, vocabulario, ortografía

### 🖥️ Interfaz
- **Diseño responsive**: Mobile-first, excelente en tablet y desktop
- **Navegación**: Bottom tab bar (mobile) / Sidebar (desktop)
- **Estilo**: Gamified Minimalist con paleta de colores moderna
- **Animaciones**: Micro-interacciones suaves

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) 16+ (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Componentes UI**: Custom components (BentoCard, ProgressCircle, etc.)
- **Testing**: [Vitest](https://vitest.dev/) (unitario) + [Playwright](https://playwright.dev/) (E2E)
- **Persistencia de progreso**: Upstash Redis/KV en Vercel para producción; fallback por archivos solo para desarrollo.

> La arquitectura y ownership de Upstash Redis/KV están documentados en [`docs/10_infrastructure/upstash_redis.md`](docs/10_infrastructure/upstash_redis.md). Leer ese documento antes de modificar persistencia, variables de entorno o infraestructura Vercel/Upstash.

---

## 📂 Estructura del Proyecto

```
src/
├── app/                          # Páginas de Next.js
│   ├── page.tsx                 # Home gamificada con recomendación canónica
│   ├── dashboard/
│   │   └── page.tsx             # Progreso por skill + siguiente paso
│   ├── practice/
│   │   ├── page.tsx             # Sesiones de práctica/lectura
│   │   └── PracticeQuestion.tsx # UI de pregunta y cierre de sesión
│   ├── habilidades/
│   │   └── page.tsx             # Grid de Matemática y Lengua
│   ├── simulaciones/
│   │   ├── page.tsx             # Simulador de Lengua
│   │   └── SimulatorQuestion.tsx
│   ├── progreso/
│   │   └── page.tsx             # Estadísticas y logros
│   ├── perfil/
│   │   └── page.tsx             # Configuración y avatar
│   ├── layout.tsx               # Layout raíz
│   └── globals.css              # Design System CSS
├── components/
│   └── ui/                      # Componentes reutilizables
│       ├── BottomNav.tsx        # Navegación mobile
│       ├── SidebarNav.tsx       # Navegación desktop
│       ├── ProgressCircle.tsx   # Círculo de progreso
│       ├── BentoCard.tsx        # Tarjetas Bento Grid
│       ├── StreakBadge.tsx      # Badge de racha
│       ├── XpBar.tsx            # Barra de experiencia
│       ├── AvatarHero.tsx       # Avatar del estudiante
│       └── Button.tsx           # Botones
├── practice/                     # Runtime canónico de práctica, lectura y simulador
├── progress/                     # Modelo de mastery/progreso
├── recommendation/               # Siguiente paso recomendado
├── skills/                       # Metadata y slugs públicos
├── storage/                      # Persistencia de progreso (Redis/KV y fallback local)
content/lengua/                  # Reading units y ejercicios canónicos
docs/04_exercise_engine/         # Corpus histórico y manifest de contenido
docs/10_infrastructure/          # Infraestructura de persistencia y ownership
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos previos
- Node.js 18+
- npm

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
# Tests unitarios de dominio
npm run test:unit

# Tests E2E con Playwright
npm run test:e2e

# Verificación de tipos
npm run typecheck

# Build de producción
npm run build
```

---

## 🎨 Paleta de Colores

- **Primary**: Turquesa (#14B8A6)
- **Accent 1**: Naranja vibrante (#F97316)
- **Accent 2**: Violeta (#A855F7)
- **Background**: Claro (#F8FAFC)
- **Success**: Verde (#10B981)

---

## ✅ Funcionalidades Implementadas

### Dashboard (Home)
- [x] Progreso del día con círculo visual
- [x] Barra de XP y nivel actual
- [x] Habilidades recomendadas
- [x] Siguiente paso recomendado desde `getNextStepRecommendation()`
- [x] Próxima simulación según `model.simulatorReadiness`
- [x] Progreso semanal
- [x] Avatar personalizable
- [x] Reporte para padres

### Habilidades
- [x] Grid de materias (Matemática y Lengua)
- [x] Progreso por habilidad
- [x] Nivel y XP
- [x] Ejercicios completados
- [x] Precisión por materia
- [x] Tags de temas
- [x] Botón "Entrenar Ahora"

### Simulaciones
- [x] Simulador de Lengua con bloques de lectura y ejercicios standalone
- [x] Persistencia de resultado en progreso local
- [x] Impacto en mastery con peso de simulador
- [x] Recomendación canónica posterior a la simulación

### Motor de práctica y recomendación
- [x] Sesiones standalone por skill/subskill
- [x] Sesiones reading-based con texto base canónico
- [x] Cierre de lectura con excerpt, comprensión lectora y glosario
- [x] Modelo de mastery trazable por skill/subskill
- [x] Slugs públicos en URLs con compatibilidad para IDs técnicos legacy
- [x] Tests unitarios para recomendación de siguiente paso

### Progreso
- [x] Estadísticas generales
- [x] Gráfico de actividad semanal
- [x] Progreso por materia
- [x] Logros desbloqueados
- [x] Reporte para padres

### Perfil
- [x] Avatar personalizable (selector)
- [x] Información personal
- [x] Configuración (settings)
- [x] Código de acceso para padres
- [x] Estadísticas de uso

---

## 🧠 Principios del Producto

1. **El aprendizaje ocurre por práctica, no por explicación**
2. **Cada ejercicio debe tener un objetivo de habilidad claro**
3. **El feedback debe ser inmediato y específico**
4. **La dificultad se adapta al nivel del usuario**
5. **La práctica debe ser constante, no extensa**
6. **La gamificación motiva al estudiante**

---

## 📌 Estado del Proyecto

**Fase**: MVP funcional de Lengua con práctica, lectura, simulador, progreso y recomendación canónica.

- ✅ Sistema de diseño y navegación implementados
- ✅ Runtime de práctica y lectura consolidado en `session_runner`
- ✅ Simulador conectado a progreso/mastery/recomendación
- ✅ Modelo de mastery canónico en `progress/mastery_model.ts`
- ✅ Recomendación de siguiente paso en `recommendation/next_step.ts`
- ✅ Slugs públicos para skills y reading units, con retrocompatibilidad
- ✅ Skill 3 ampliada con ejercicios `multiple_choice` compatibles con simulador
- 🔄 Próximo foco: tests de slugs, verificación de skill 3 en simulador y expansión de reading units
- ⏳ Backend, cuentas, pagos y Matemática quedan fuera del corto plazo

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

## 🤝 Contribución

Para mantener el proyecto actualizado después de cambios en código:

```bash
# Actualizar knowledge graph (sin costo API)
graphify update .
```

Para leer el grafo con nombres arquitectónicos humanos, usar:

- `docs/architecture/graphify-human-index.md`
