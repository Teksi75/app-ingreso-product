"use client";

/**
 * BentoCard - Tarjeta del Bento Grid
 * ==================================
 * Componente de tarjeta flexible para layouts tipo Bento Grid.
 * Diseño modular con variantes para diferentes tipos de contenido.
 * 
 * UX Decisions:
 * - Bordes redondeados grandes (16px) para apariencia amigable
 * - Sombra sutil que se intensifica en hover para feedback táctil
 * - Padding generoso para contenido respirable
 * - Iconos grandes y coloridos para identificación rápida
 * - Efecto de elevación suave en hover para interactividad
 */

import { ReactNode } from "react";

type BentoCardProps = {
  /** Contenido de la tarjeta */
  children: ReactNode;
  /** Título opcional */
  title?: string;
  /** Subtítulo o descripción */
  subtitle?: string;
  /** Icono decorativo */
  icon?: ReactNode;
  /** Color de acento para el icono/fondo */
  accentColor?: "teal" | "orange" | "violet" | "emerald" | "blue" | "rose";
  /** Variante de tamaño */
  variant?: "default" | "large" | "compact";
  /** Acción al hacer click */
  onClick?: () => void;
  /** Clases adicionales */
  className?: string;
  /** Elemento adicional en la esquina (badge, botón, etc.) */
  action?: ReactNode;
};

export function BentoCard({
  children,
  title,
  subtitle,
  icon,
  accentColor = "teal",
  variant = "default",
  onClick,
  className = "",
  action,
}: BentoCardProps) {
  // Configuración de colores de acento
  const colorConfig = {
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-100",
      hover: "hover:border-teal-200",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
      hover: "hover:border-orange-200",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-100",
      hover: "hover:border-violet-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      hover: "hover:border-emerald-200",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      hover: "hover:border-blue-200",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      hover: "hover:border-rose-200",
    },
  };

  const colors = colorConfig[accentColor];
  
  // Configuración de variantes de tamaño
  const sizeConfig = {
    compact: "p-4",
    default: "p-5",
    large: "p-6",
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white rounded-2xl border border-slate-100
        ${sizeConfig[variant]}
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        min-w-0 overflow-hidden
        ${onClick ? "cursor-pointer" : ""}
        ${colors.hover}
        ${className}
      `}
    >
      {/* Header con icono y acción */}
      {(icon || title || action) && (
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${colors.bg} ${colors.text}
                transition-transform duration-300 group-hover:scale-110
              `}>
                {icon}
              </div>
            )}
            
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className="font-bold text-slate-800 text-base leading-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      
      {/* Contenido principal */}
      <div className={icon || title ? "mt-2" : ""}>
        {children}
      </div>
    </div>
  );
}

/**
 * BentoGrid - Contenedor de grid para tarjetas Bento
 */
type BentoGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
};

export function BentoGrid({ 
  children, 
  className = "",
  columns = 2 
}: BentoGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${columnClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}
