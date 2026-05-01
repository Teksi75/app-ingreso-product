"use client";

/**
 * StreakBadge - Insignia de Racha Diaria
 * ======================================
 * Muestra el número de días consecutivos que el estudiante
 * ha completado al menos una actividad.
 * 
 * UX Decisions:
 * - Icono de fuego animado para motivación emocional
 * - Colores cálidos (naranja/rojo) que evocan energía
 * - Tamaño prominente pero no invasivo
 * - Efecto de "llama" para destacar la racha activa
 * - Indicador visual de meta alcanzada
 */

type StreakBadgeProps = {
  /** Número de días de racha */
  days: number;
  /** Meta de racha para mostrar celebración */
  goal?: number;
  /** Tamaño del badge */
  size?: "sm" | "md" | "lg";
  /** Mostrar etiqueta "días" */
  showLabel?: boolean;
  className?: string;
};

export function StreakBadge({
  days,
  goal = 7,
  size = "md",
  showLabel = true,
  className = "",
}: StreakBadgeProps) {
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: "px-2 py-1 gap-1",
      icon: "w-4 h-4",
      number: "text-sm",
      label: "text-[10px]",
    },
    md: {
      container: "px-3 py-1.5 gap-1.5",
      icon: "w-5 h-5",
      number: "text-base",
      label: "text-xs",
    },
    lg: {
      container: "px-4 py-2 gap-2",
      icon: "w-6 h-6",
      number: "text-lg",
      label: "text-sm",
    },
  };

  const config = sizeConfig[size];
  const hasReachedGoal = days >= goal;
  
  // Determinar color según la racha
  const getStreakColor = (days: number) => {
    if (days >= 30) return "from-rose-500 via-orange-500 to-amber-400"; // Racha épica
    if (days >= 14) return "from-orange-500 via-amber-500 to-yellow-400"; // Racha alta
    if (days >= 7) return "from-amber-500 via-orange-400 to-yellow-300"; // Racha buena
    if (days >= 3) return "from-orange-400 via-amber-400 to-yellow-300"; // Racha iniciada
    return "from-orange-50 to-white"; // Racha temprana
  };
  const textColor = days >= 3 ? "text-white" : "text-orange-600";

  return (
    <div
      className={`
        inline-flex items-center rounded-full
        bg-gradient-to-r ${getStreakColor(days)}
        ${textColor} font-bold shadow-soft-sm ring-1 ring-orange-200/70
        transition-transform duration-200 hover:scale-105
        ${config.container}
        ${className}
      `}
      aria-label={`Racha de ${days} ${days === 1 ? "día" : "días"}`}
    >
      {/* Icono de fuego con animación */}
      <svg
        className={`${config.icon} animate-flame`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C10.5 4.5 9 7 9 9c0 1.5.5 3 2 4-.5-1.5-.5-3 0-4.5.5 2 2 3.5 3.5 4.5-.5-1-.5-2.5.5-4 1 1.5 2 3.5 2 6 0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5 0-2.5 1-4.5 2.5-6-1 1.5-1 3 0 4.5 1.5-1 3-2.5 3.5-4.5.5 1.5.5 3 0 4.5 1.5-1 2-2.5 2-4 0-2-1.5-4.5-3-9z" />
      </svg>
      
      {/* Número de días */}
      <span className={config.number}>{days}</span>
      
      {/* Etiqueta opcional */}
      {showLabel && (
        <span className={`${config.label} opacity-90 font-medium`}>
          {days === 1 ? "día" : "días"}
        </span>
      )}
      
      {/* Indicador de meta alcanzada */}
      {hasReachedGoal && (
        <span className="ml-1 text-yellow-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </span>
      )}
    </div>
  );
}

/**
 * StreakFlame - Solo el icono de fuego animado
 */
export function StreakFlame({ 
  className = "",
  size = 24,
}: { 
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-orange-500 animate-flame ${className}`}
    >
      <path d="M12 2C10.5 4.5 9 7 9 9c0 1.5.5 3 2 4-.5-1.5-.5-3 0-4.5.5 2 2 3.5 3.5 4.5-.5-1-.5-2.5.5-4 1 1.5 2 3.5 2 6 0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5 0-2.5 1-4.5 2.5-6-1 1.5-1 3 0 4.5 1.5-1 3-2.5 3.5-4.5.5 1.5.5 3 0 4.5 1.5-1 2-2.5 2-4 0-2-1.5-4.5-3-9z" />
    </svg>
  );
}
