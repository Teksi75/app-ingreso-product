"use client";

/**
 * XpBar - Barra de Experiencia y Nivel
 * ====================================
 * Muestra el progreso de XP hacia el siguiente nivel
 * y el nivel actual del estudiante.
 * 
 * UX Decisions:
 * - Barra de progreso con gradiente llamativo
 * - Número de nivel prominente para motivación
 * - XP restante visible para meta clara
 * - Animación suave al cargar
 * - Indicador de "nivel épico" en milestones
 */

type XpBarProps = {
  /** XP actual */
  currentXp: number;
  /** XP necesario para el siguiente nivel */
  xpToNextLevel: number;
  /** Nivel actual */
  level: number;
  /** Título del rango/nivel (ej: "Aprendiz", "Experto") */
  rank?: string;
  /** Mostrar versión compacta */
  compact?: boolean;
  className?: string;
};

export function XpBar({
  currentXp,
  xpToNextLevel,
  level,
  rank,
  compact = false,
  className = "",
}: XpBarProps) {
  const progress = Math.min(100, Math.max(0, (currentXp / xpToNextLevel) * 100));
  const remainingXp = xpToNextLevel - currentXp;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Nivel en círculo */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {level}
          </div>
          {rank && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-violet-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
              {rank}
            </div>
          )}
        </div>
        
        {/* Barra de XP */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-600">
              Nivel {level}
            </span>
            <span className="text-xs text-slate-400">
              {currentXp}/{xpToNextLevel} XP
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Nivel grande */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-500 flex flex-col items-center justify-center text-white shadow-lg shadow-teal-200">
            <span className="text-xs font-medium opacity-90">NIVEL</span>
            <span className="text-2xl font-extrabold -mt-0.5">{level}</span>
          </div>
          
          {/* Indicador épico para niveles altos */}
          {level >= 10 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Info de XP */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800">
              {rank || `Nivel ${level}`}
            </h3>
            {rank && (
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                {rank}
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-500 mb-3">
            {remainingXp} XP para el siguiente nivel
          </p>
          
          {/* Barra de progreso */}
          <div className="relative">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Marcadores de progreso */}
            <div className="flex justify-between mt-1">
              <span className="text-xs font-medium text-teal-600">{currentXp} XP</span>
              <span className="text-xs text-slate-400">{xpToNextLevel} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MiniXpBadge - Badge pequeño de XP para mostrar ganancias
 */
export function MiniXpBadge({ 
  amount, 
  className = "" 
}: { 
  amount: number;
  className?: string;
}) {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5
      bg-teal-100 text-teal-700 text-xs font-bold rounded-full
      animate-scale-in
      ${className}
    `}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      +{amount} XP
    </span>
  );
}
