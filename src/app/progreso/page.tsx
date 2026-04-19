"use client";

/**
 * Progreso / Seguimiento - Página de Estadísticas
 * ===============================================
 * Gráficos, heatmaps y reportes de progreso del estudiante.
 * Solo Matemática y Lengua son las materias del ingreso.
 */

import {
  BottomNav,
  SidebarNav,
  Button,
} from "@/components/ui";

const WEEKLY_DATA = [
  { day: "L", exercises: 12, accuracy: 85 },
  { day: "M", exercises: 8, accuracy: 78 },
  { day: "X", exercises: 15, accuracy: 82 },
  { day: "J", exercises: 10, accuracy: 90 },
  { day: "V", exercises: 2, accuracy: 100 },
  { day: "S", exercises: 0, accuracy: 0 },
  { day: "D", exercises: 0, accuracy: 0 },
];

// Solo Matemática y Lengua
const SKILL_PROGRESS = [
  { name: "Matemática", progress: 68, color: "bg-teal-500" },
  { name: "Lengua", progress: 45, color: "bg-violet-500" },
];

const ACHIEVEMENTS = [
  { id: 1, title: "Primeros Pasos", description: "Completaste tu primer ejercicio", icon: "🌟", unlocked: true },
  { id: 2, title: "Racha de 7 días", description: "Estudiaste 7 días seguidos", icon: "🔥", unlocked: true },
  { id: 3, title: "Matemático", description: "Nivel 5 en Matemática", icon: "🧮", unlocked: true },
  { id: 4, title: "Racha de 30 días", description: "Estudiaste 30 días seguidos", icon: "🏆", unlocked: false },
  { id: 5, title: "Experto", description: "Alcanza nivel 10 en cualquier materia", icon: "👑", unlocked: false },
  { id: 6, title: "Simulacro Perfecto", description: "Obtén 100% en un simulacro", icon: "🎯", unlocked: false },
];

export default function ProgresoPage() {
  const totalExercises = 245;
  const totalTime = "8.5h";
  const currentStreak = 12;
  const bestStreak = 15;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-800">Mi Progreso</h1>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-xl">
                📊
              </div>
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block bg-white border-b border-slate-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Mi Progreso</h1>
                <p className="text-slate-500">Seguimiento de tu aprendizaje en Matemática y Lengua</p>
              </div>
              <Button variant="secondary" icon={<span>📥</span>}>
                Descargar Reporte
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm text-slate-500">Ejercicios</p>
              <p className="text-2xl font-bold text-slate-800">{totalExercises}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">⏱️</div>
              <p className="text-sm text-slate-500">Tiempo Total</p>
              <p className="text-2xl font-bold text-teal-600">{totalTime}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-sm text-slate-500">Racha Actual</p>
              <p className="text-2xl font-bold text-orange-600">{currentStreak} días</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm text-slate-500">Mejor Racha</p>
              <p className="text-2xl font-bold text-violet-600">{bestStreak} días</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Weekly Activity */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <h2 className="font-bold text-slate-800 mb-4">Actividad Semanal</h2>
              <div className="flex justify-between items-end h-40 gap-2">
                {WEEKLY_DATA.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden" style={{ height: `${Math.max(day.exercises * 8, 4)}px` }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-teal-500 transition-all" style={{ height: `${day.accuracy}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 mt-2">{day.day}</span>
                    <span className="text-xs text-slate-400">{day.exercises}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-teal-500 rounded" /> Precisión
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-slate-200 rounded" /> Ejercicios
                </div>
              </div>
            </div>

            {/* Skills Progress - Solo 2 materias */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <h2 className="font-bold text-slate-800 mb-4">Progreso por Materia</h2>
              <div className="space-y-3">
                {SKILL_PROGRESS.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                      <span className="text-sm font-bold text-slate-800">{skill.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-6">
            <h2 className="font-bold text-slate-800 mb-4">Logros Desbloqueados</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${achievement.unlocked 
                      ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" 
                      : "bg-slate-50 border-slate-200 opacity-50"
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-bold text-slate-800 text-sm">{achievement.title}</h3>
                  <p className="text-xs text-slate-500">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Report Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                📋
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-1">Reporte para Padres</h2>
                <p className="text-slate-300 text-sm mb-4">
                  Informe detallado listo para compartir. Incluye estadísticas de progreso en Matemática y Lengua, 
                  áreas de mejora y recomendaciones personalizadas.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm">
                    Ver Reporte Online
                  </Button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors">
                    Enviar por Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
