"use client";

/**
 * AvatarHero - Avatar del Estudiante con temática Hero
 * ====================================================
 * Muestra el avatar personalizable del estudiante con
 * indicadores de nivel, equipo y estado actual.
 * 
 * UX Decisions:
 * - Avatar grande y central como protagonista
 * - Efectos visuales de "poder" según el nivel
 * - Indicadores de equipo/logros alrededor
 * - Animación de entrada impactante
 * - Personalización visual clara
 */

import { ReactNode } from "react";

type AvatarHeroProps = {
  /** Nombre del estudiante */
  name: string;
  /** Nivel actual */
  level: number;
  /** Título/rango actual */
  rank: string;
  /** URL de la imagen del avatar (opcional) */
  avatarUrl?: string;
  /** Elemento decorativo/equipo actual */
  equipment?: string;
  /** Estado de ánimo/energía (0-100) */
  energy?: number;
  className?: string;
};

export function AvatarHero({
  name,
  level,
  rank,
  avatarUrl,
  equipment,
  energy = 100,
  className = "",
}: AvatarHeroProps) {
  // Determinar tamaño y efectos según nivel
  const isEpic = level >= 15;
  const isAdvanced = level >= 10;
  
  return (
    <div className={`relative ${className}`}>
      {/* Aura/Glow para niveles altos */}
      {isEpic && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-teal-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
      )}
      
      {/* Contenedor principal */}
      <div className="relative flex flex-col items-center">
        {/* Anillo de nivel */}
        <div className="relative">
          {/* Círculo exterior con progreso de nivel */}
          <div className={`
            w-32 h-32 rounded-full p-1.5
            bg-gradient-to-br from-teal-400 via-violet-500 to-orange-500
            ${isEpic ? "animate-pulse-glow" : ""}
          `}>
            <div className="w-full h-full rounded-full bg-white p-1">
              {/* Avatar */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-5xl">
                    {isEpic ? "🦸" : isAdvanced ? "⭐" : "🎓"}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Badge de nivel */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className={`
              px-3 py-1 rounded-full font-bold text-white text-sm
              bg-gradient-to-r from-teal-500 to-emerald-500
              shadow-lg shadow-teal-200
              ${isEpic ? "animate-bounce" : ""}
            `}>
              Nivel {level}
            </div>
          </div>
          
          {/* Indicadores de equipo (solo niveles avanzados) */}
          {isAdvanced && (
            <>
              {/* Corona/Escudo izquierdo */}
              <div className="absolute -left-2 top-1/4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                <span className="text-lg">🏆</span>
              </div>
              
              {/* Escudo derecho */}
              <div className="absolute -right-2 top-1/3 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-lg">🛡️</span>
              </div>
            </>
          )}
        </div>
        
        {/* Info del estudiante */}
        <div className="mt-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className={`
              px-3 py-0.5 rounded-full text-sm font-bold
              ${isEpic 
                ? "bg-gradient-to-r from-violet-100 to-orange-100 text-violet-700" 
                : "bg-teal-100 text-teal-700"
              }
            `}>
              {rank}
            </span>
          </div>
        </div>
        
        {/* Barra de energía */}
        <div className="mt-4 w-full max-w-[200px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Energía</span>
            <span className="text-xs font-bold text-orange-500">{energy}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MiniAvatar - Versión compacta del avatar
 */
export function MiniAvatar({
  name,
  level,
  avatarUrl,
  size = "md",
}: {
  name: string;
  level: number;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeConfig = {
    sm: { container: "w-10 h-10", text: "text-lg", badge: "text-[10px] px-1.5" },
    md: { container: "w-12 h-12", text: "text-2xl", badge: "text-xs px-2" },
    lg: { container: "w-16 h-16", text: "text-3xl", badge: "text-sm px-2.5" },
  };

  const config = sizeConfig[size];

  return (
    <div className="relative inline-block">
      <div className={`${config.container} rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center overflow-hidden`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={config.text}>🎓</span>
        )}
      </div>
      {level > 0 && (
        <div className={`absolute -bottom-1 -right-1 bg-teal-500 text-white font-bold rounded-full ${config.badge}`}>
          {level}
        </div>
      )}
    </div>
  );
}
