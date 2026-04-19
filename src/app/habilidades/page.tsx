"use client";

/**
 * Habilidades / Entrenamiento - Página de Habilidades
 * ===================================================
 * Muestra todas las áreas de estudio disponibles con su progreso.
 * 
 * Solo Matemática y Lengua son las materias que se rinden en el ingreso.
 */

import { useState } from "react";
import {
  BottomNav,
  SidebarNav,
  Button,
} from "@/components/ui";

// Solo Matemática y Lengua - las únicas materias del ingreso
const HABILIDADES = [
  {
    id: "matematica",
    name: "Matemática",
    description: "Números, operaciones, geometría y lógica",
    icon: "🧮",
    color: "teal",
    level: 5,
    progress: 68,
    xp: 680,
    xpTotal: 1000,
    exercises: 156,
    accuracy: 82,
    topics: ["Aritmética", "Fracciones", "Geometría", "Proporciones", "Estadística"],
  },
  {
    id: "lengua",
    name: "Lengua",
    description: "Comprensión lectora, gramática y escritura",
    icon: "📚",
    color: "violet",
    level: 3,
    progress: 45,
    xp: 450,
    xpTotal: 1000,
    exercises: 89,
    accuracy: 78,
    topics: ["Comprensión lectora", "Gramática", "Vocabulario", "Ortografía", "Escritura"],
  },
];

// Configuración de colores
const colorConfig: Record<string, { bg: string; text: string; button: string; progress: string; border: string }> = {
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    button: "bg-teal-500 hover:bg-teal-600",
    progress: "bg-teal-500",
    border: "border-teal-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    button: "bg-violet-500 hover:bg-violet-600",
    progress: "bg-violet-500",
    border: "border-violet-100",
  },
};

export default function HabilidadesPage() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const totalExercises = HABILIDADES.reduce((acc, h) => acc + h.exercises, 0);
  const averageAccuracy = Math.round(
    HABILIDADES.reduce((acc, h) => acc + h.accuracy, 0) / HABILIDADES.length
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop only */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-800">Mis Habilidades</h1>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-xl">
                🎯
              </div>
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block bg-white border-b border-slate-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Mis Habilidades</h1>
                <p className="text-slate-500">Domina Matemática y Lengua para el ingreso</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Ejercicios totales</p>
                  <p className="text-2xl font-bold text-teal-600">{totalExercises}</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-right">
                  <p className="text-sm text-slate-500">Precisión</p>
                  <p className="text-2xl font-bold text-orange-600">{averageAccuracy}%</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-slate-500">Materias</p>
              <p className="text-2xl font-bold text-slate-800">{HABILIDADES.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-slate-500">Dominadas</p>
              <p className="text-2xl font-bold text-teal-600">
                {HABILIDADES.filter(h => h.progress >= 70).length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-sm text-slate-500">En progreso</p>
              <p className="text-2xl font-bold text-violet-600">
                {HABILIDADES.filter(h => h.progress >= 30 && h.progress < 70).length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-slate-500">Por iniciar</p>
              <p className="text-2xl font-bold text-orange-600">
                {HABILIDADES.filter(h => h.progress < 30).length}
              </p>
            </div>
          </div>

          {/* Skills Grid - Solo 2 materias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {HABILIDADES.map((skill) => {
              const colors = colorConfig[skill.color];
              const isSelected = selectedSkill === skill.id;

              return (
                <div
                  key={skill.id}
                  className={`
                    bg-white rounded-2xl p-5 border transition-all duration-300
                    hover:shadow-lg hover:-translate-y-0.5 cursor-pointer
                    ${isSelected ? `ring-2 ring-offset-2 ring-${skill.color}-500` : colors.border}
                  `}
                  onClick={() => setSelectedSkill(skill.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                        ${colors.bg}
                      `}>
                        {skill.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{skill.name}</h3>
                        <p className="text-sm text-slate-500">{skill.description}</p>
                      </div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-bold
                      ${colors.bg} ${colors.text}
                    `}>
                      Nv. {skill.level}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-500">Progreso</span>
                      <span className="text-sm font-bold text-slate-700">{skill.progress}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400">{skill.xp} XP</span>
                      <span className="text-xs text-slate-400">{skill.xpTotal} XP</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-lg font-bold text-slate-800">{skill.exercises}</p>
                      <p className="text-xs text-slate-500">Ejercicios</p>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-lg font-bold text-slate-800">{skill.accuracy}%</p>
                      <p className="text-xs text-slate-500">Precisión</p>
                    </div>
                  </div>

                  {/* Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skill.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className={`px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text}`}
                      >
                        {topic}
                      </span>
                    ))}
                    {skill.topics.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-500">
                        +{skill.topics.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    className={`
                      w-full py-3 rounded-xl font-semibold text-white
                      transition-all duration-200 active:scale-95
                      flex items-center justify-center gap-2
                      ${colors.button}
                    `}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Entrenar Ahora
                  </button>
                </div>
              );
            })}
          </div>

          {/* Recommendation Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recomendaciones</h2>
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-2xl flex-shrink-0">
                  💡
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">¿Sabías que...?</h3>
                  <p className="text-slate-600 mb-3">
                    La <span className="font-semibold text-violet-600">Lengua</span> es tu área con mayor potencial de mejora. 
                    Solo necesitas 8 ejercicios más para subir al nivel 4.
                  </p>
                  <Button variant="secondary" size="sm">
                    Practicar Lengua
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
