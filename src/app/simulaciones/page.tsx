"use client";

/**
 * Simulaciones - Página de Exámenes Simulados
 * ===========================================
 * Lista de exámenes simulados disponibles con información detallada.
 * Solo Matemática y Lengua son las materias del ingreso.
 */

import {
  BottomNav,
  SidebarNav,
  Button,
} from "@/components/ui";

const SIMULACIONES = [
  {
    id: 1,
    title: "Simulacro de Admisión #1",
    description: "Examen completo - Matemática y Lengua",
    duration: "90 minutos",
    questions: 60,
    difficulty: "Medio",
    topics: ["Matemática", "Lengua"],
    completed: true,
    score: 78,
    date: "15/04/2026",
  },
  {
    id: 2,
    title: "Simulacro de Admisión #2",
    description: "Segundo examen de práctica",
    duration: "90 minutos",
    questions: 60,
    difficulty: "Medio-Alto",
    topics: ["Matemática", "Lengua"],
    completed: true,
    score: 82,
    date: "18/04/2026",
  },
  {
    id: 3,
    title: "Simulacro de Admisión #3",
    description: "Tercer examen - Nivel avanzado",
    duration: "90 minutos",
    questions: 60,
    difficulty: "Alto",
    topics: ["Matemática", "Lengua"],
    completed: false,
    scheduled: "Mañana, 15:00",
  },
  {
    id: 4,
    title: "Simulacro Rápido - Matemática",
    description: "Enfoque exclusivo en matemática",
    duration: "30 minutos",
    questions: 20,
    difficulty: "Medio",
    topics: ["Matemática"],
    completed: false,
  },
  {
    id: 5,
    title: "Simulacro Rápido - Lengua",
    description: "Enfoque exclusivo en lengua",
    duration: "30 minutos",
    questions: 20,
    difficulty: "Medio",
    topics: ["Lengua"],
    completed: false,
  },
];

export default function SimulacionesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-800">Simulaciones</h1>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-xl">
                📝
              </div>
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block bg-white border-b border-slate-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Simulaciones</h1>
                <p className="text-slate-500">Practica con exámenes simulados de Matemática y Lengua</p>
              </div>
              <Button variant="primary" icon={<span>▶️</span>}>
                Iniciar Simulación Rápida
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-sm text-slate-500">Completados</p>
              <p className="text-2xl font-bold text-teal-600">2</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-sm text-slate-500">Promedio</p>
              <p className="text-2xl font-bold text-orange-600">80%</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-sm text-slate-500">Próximo</p>
              <p className="text-2xl font-bold text-violet-600">Mañana</p>
            </div>
          </div>

          {/* Simulaciones List */}
          <div className="space-y-4">
            {SIMULACIONES.map((sim) => (
              <div
                key={sim.id}
                className={`
                  bg-white rounded-2xl p-5 border transition-all duration-200
                  ${sim.completed 
                    ? "border-slate-100 opacity-75" 
                    : "border-slate-200 hover:shadow-md"
                  }
                `}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${sim.completed ? "bg-emerald-50" : "bg-violet-50"}
                    `}>
                      {sim.completed ? "✅" : "📝"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{sim.title}</h3>
                      <p className="text-sm text-slate-500">{sim.description}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <span>⏱️</span> {sim.duration}
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <span>❓</span> {sim.questions} preguntas
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${sim.difficulty === "Alto" ? "bg-red-100 text-red-700" :
                          sim.difficulty === "Medio-Alto" ? "bg-orange-100 text-orange-700" :
                          "bg-green-100 text-green-700"
                        }
                      `}>
                        {sim.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-3">
                    {sim.completed ? (
                      <>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Puntuación</p>
                          <p className="text-xl font-bold text-emerald-600">{sim.score}%</p>
                        </div>
                        <Button variant="secondary" size="sm">
                          Ver Resultados
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" size="sm" icon={<span>▶️</span>}>
                        {sim.scheduled ? "Iniciar" : "Comenzar"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Topics */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {sim.topics.map((topic) => (
                      <span key={topic} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
