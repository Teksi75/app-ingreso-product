"use client";

/**
 * Button - Botón principal de acción
 * ==================================
 * Botón reutilizable con múltiples variantes y estados.
 * 
 * UX Decisions:
 * - Tamaño mínimo táctil de 44px
 * - Feedback visual claro en hover/active
 * - Estados de loading y disabled
 * - Iconos opcionales con espaciado adecuado
 * - Bordes redondeados para apariencia amigable
 */

import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Configuración de variantes
  const variantClasses = {
    primary: `
      bg-teal-500 text-white
      hover:bg-teal-600
      active:bg-teal-700
      shadow-md shadow-teal-200
      hover:shadow-lg hover:shadow-teal-200
    `,
    secondary: `
      bg-white text-slate-700
      border border-slate-200
      hover:bg-slate-50 hover:border-slate-300
      active:bg-slate-100
      shadow-sm
    `,
    accent: `
      bg-orange-500 text-white
      hover:bg-orange-600
      active:bg-orange-700
      shadow-md shadow-orange-200
      hover:shadow-lg hover:shadow-orange-200
    `,
    ghost: `
      bg-transparent text-slate-600
      hover:bg-slate-100
      active:bg-slate-200
    `,
    outline: `
      bg-transparent text-teal-600
      border-2 border-teal-500
      hover:bg-teal-50
      active:bg-teal-100
    `,
  };

  // Configuración de tamaños
  const sizeClasses = {
    sm: "px-3 py-2 text-sm gap-1.5 rounded-lg",
    md: "px-5 py-3 text-base gap-2 rounded-xl",
    lg: "px-6 py-4 text-lg gap-2.5 rounded-xl",
  };

  const content = isLoading ? (
    <>
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Cargando...</span>
    </>
  ) : (
    <>
      {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
    </>
  );
  const buttonClasses = `
    inline-flex items-center justify-center
    font-semibold
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
    active:scale-95
    touch-target
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  if (href && !disabled && !isLoading) {
    return (
      <Link className={buttonClasses} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * IconButton - Botón solo con icono
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const variantClasses = {
    primary: "bg-teal-500 text-white hover:bg-teal-600",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      aria-label={label}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-xl
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
        touch-target
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}
