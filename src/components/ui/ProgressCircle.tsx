"use client";

/**
 * ProgressCircle - Círculo de progreso animado
 * =============================================
 * Componente visual para mostrar progreso en formato circular.
 * Ideal para mostrar "Progreso del día" o completitud de tareas.
 * 
 * UX Decisions:
 * - Círculo grande y visible para motivación visual inmediata
 * - Animación suave al cargar para engagement
 * - Color que cambia según el porcentaje (verde éxito, naranja progreso)
 * - Tamaño de fuente grande para lectura fácil
 * - Stroke redondeado para apariencia moderna
 */

type ProgressCircleProps = {
  /** Porcentaje de progreso (0-100) */
  progress: number;
  /** Tamaño del círculo en píxeles */
  size?: number;
  /** Grosor de la línea de progreso */
  strokeWidth?: number;
  /** Texto personalizado en el centro (opcional) */
  label?: string;
  /** Color del progreso - usa colores del theme */
  color?: "primary" | "success" | "accent" | "violet";
  /** Clases adicionales de Tailwind */
  className?: string;
};

export function ProgressCircle({
  progress,
  size = 140,
  strokeWidth = 10,
  label,
  color = "primary",
  className = "",
}: ProgressCircleProps) {
  // Asegurar que el progreso esté entre 0 y 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  // Calcular dimensiones
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;
  
  // Seleccionar color según prop
  const colorClasses = {
    primary: "stroke-teal-500",
    success: "stroke-emerald-500",
    accent: "stroke-orange-500",
    violet: "stroke-violet-500",
  };
  
  const bgColorClasses = {
    primary: "text-teal-500",
    success: "text-emerald-500",
    accent: "text-orange-500",
    violet: "text-violet-500",
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Círculo de fondo (track) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`
            ${colorClasses[color]} 
            transition-all duration-700 ease-out
            animate-pulse-glow
          `}
          style={{
            filter: "drop-shadow(0 0 6px rgba(20, 184, 166, 0.3))",
          }}
        />
      </svg>
      
      {/* Contenido centrado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ? (
          <span className={`text-2xl font-bold ${bgColorClasses[color]}`}>
            {label}
          </span>
        ) : (
          <>
            <span className={`text-3xl font-extrabold ${bgColorClasses[color]}`}>
              {Math.round(clampedProgress)}%
            </span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">
              completado
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * MiniProgressCircle - Versión compacta para tarjetas
 */
export function MiniProgressCircle({
  progress,
  size = 48,
  strokeWidth = 4,
  color = "primary",
}: Omit<ProgressCircleProps, "label">) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;
  
  const colorClasses = {
    primary: "stroke-teal-500",
    success: "stroke-emerald-500",
    accent: "stroke-orange-500",
    violet: "stroke-violet-500",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClasses[color]} transition-all duration-500`}
        />
      </svg>
    </div>
  );
}
