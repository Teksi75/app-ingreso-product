"use client";

/**
 * SkillCard - Tarjeta de Habilidad/Área de Estudio
 * ================================================
 * Muestra una habilidad o materia con su progreso,
 * nivel y botón de acción.
 * 
 * UX Decisions:
 * - Icono grande y colorido para identificación rápida
 * - Barra de progreso clara con porcentaje
 * - Indicador de nivel actual
 * - Botón de acción prominente
 * - Hover efectivo para feedback táctil
 */

import { ReactNode } from "react";
import { MiniProgressCircle } from "./ProgressCircle";

type SkillCardProps = {
  /** Nombre de la habilidad */
  name: string;
  /** Icono representativo */
  icon: ReactNode;
  /** Color de acento */
  color: "teal" | "blue" | "violet" | "orange" | "emerald" | "rose";
  /** Progreso actual (0-100) */
  progress: number;
  /** Nivel actual */
  level: number;
  /** XP actual en esta habilidad */
  currentXp: number;
  /** XP total para siguiente nivel */
  totalXp: number;
  /** Descripción corta */
  description?: string;
  /** Acción al hacer click en "Entrenar" */
  onTrain?: () => void;
  className?: string;
};

export function SkillCard({
  name,
  icon,
  color,
  progress,
  level,
  currentXp,
  totalXp,
  description,
  onTrain,
  className = "",
}: SkillCardProps) {
  // Configuración de colores
  const colorConfig = {
    teal: {
      bg: "bg-teal-50",
      border: "border-teal-100",
      icon: "text-teal-600",
      button: "bg-teal-500 hover:bg-teal-600",
      progress: "bg-teal-500",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: "text-blue-600",
      button: "bg-blue-500 hover:bg-blue-600",
      progress: "bg-blue-500",
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-100",
      icon: "text-violet-600",
      button: "bg-violet-500 hover:bg-violet-600",
      progress: "bg-violet-500",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-100",
      icon: "text-orange-600",
      button: "bg-orange-500 hover:bg-orange-600",
      progress: "bg-orange-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: "text-emerald-600",
      button: "bg-emerald-500 hover:bg-emerald-600",
      progress: "bg-emerald-500",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      icon: "text-rose-600",
      button: "bg-rose-500 hover:bg-rose-600",
      progress: "bg-rose-500",
    },
  };

  const colors = colorConfig[color];

  return (
    <div className={`
      bg-white rounded-2xl border ${colors.border} p-5
      transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
      ${className}
    `}>
      {/* Header con icono y nivel */}
      <div className="flex items-start justify-between mb-4">
        <div className={`
          w-14 h-14 rounded-2xl ${colors.bg} ${colors.icon}
          flex items-center justify-center
          transition-transform duration-300 hover:scale-110
        `}>
          {icon}
        </div>
        
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Nivel
          </span>
          <div className="text-2xl font-extrabold text-slate-800">
            {level}
          </div>
        </div>
      </div>
      
      {/* Nombre y descripción */}
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        {name}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4">
          {description}
        </p>
      )}
      
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">
            Progreso
          </span>
          <span className="text-sm font-bold text-slate-800">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-400">{currentXp} XP</span>
          <span className="text-xs text-slate-400">{totalXp} XP</span>
        </div>
      </div>
      
      {/* Botón de acción */}
      <button
        onClick={onTrain}
        className={`
          w-full py-3 px-4 rounded-xl
          ${colors.button} text-white font-semibold
          transition-all duration-200
          active:scale-95
          flex items-center justify-center gap-2
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Entrenar ahora
      </button>
    </div>
  );
}
