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
- **Testing**: [Playwright](https://playwright.dev/) (E2E)

---

## 📂 Estructura del Proyecto

```
src/
├── app/                          # Páginas de Next.js
│   ├── page.tsx                 # Dashboard (Home)
│   ├── habilidades/
│   │   └── page.tsx             # Grid de Matemática y Lengua
│   ├── simulaciones/
│   │   └── page.tsx             # Lista de simulacros
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
├── practice/                     # Lógica de negocio (legacy)
└── storage/                      # Persistencia (legacy)
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
- [x] Desafío del día
- [x] Próxima simulación
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
- [x] Lista de simulacros
- [x] Completados vs pendientes
- [x] Puntuaciones
- [x] Dificultad
- [x] Duración y cantidad de preguntas
- [x] Botón para iniciar

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

**Fase**: UI/UX Completo - Lista para integración de backend

- ✅ Sistema de diseño implementado
- ✅ 5 pantallas principales completas
- ✅ Navegación funcional (Next.js routing)
- ✅ Componentes UI reutilizables
- ✅ Responsive design (mobile/desktop)
- ✅ Gamificación visual (niveles, XP, logros)
- 🔄 Integración con sistema de práctica (en progreso)
- ⏳ Backend y persistencia real (próximamente)

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

## 🤝 Contribución

Para mantener el proyecto actualizado después de cambios en código:

```bash
# Actualizar knowledge graph (sin costo API)
npx graphify update .
```
