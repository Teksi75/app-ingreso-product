"use client";

/**
 * BottomNav - Barra de navegación inferior
 * =========================================
 * Navegación principal mobile-first con Next.js Link.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { withProgressCode } from "@/app/progress_code_href";

const navItems = [
  { id: "home", label: "Inicio", href: "/" },
  { id: "skills", label: "Habilidades", href: "/habilidades" },
  { id: "simulator", label: "Simulaciones", href: "/simulaciones" },
  { id: "progress", label: "Progreso", href: "/progreso" },
  { id: "profile", label: "Perfil", href: "/perfil" },
];

// Iconos SVG
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SkillsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const SimulatorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ProgressIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  home: HomeIcon,
  skills: SkillsIcon,
  simulator: SimulatorIcon,
  progress: ProgressIcon,
  profile: ProfileIcon,
};

export function BottomNav() {
  const pathname = usePathname();
  const progressCode = useProgressCodeFromLocation(pathname);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="flex items-center justify-around h-[4.5rem] px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = iconMap[item.id];
          
          return (
            <Link
              key={item.id}
              href={withProgressCode(item.href, progressCode)}
              className={`
                flex flex-col items-center justify-center gap-1 
                min-w-[3.5rem] min-h-[3.5rem] rounded-xl
                transition-all duration-200 ease-out
                touch-target
                ${isActive 
                  ? "text-teal-500 scale-105" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <div className={`
                relative p-1.5 rounded-lg transition-all duration-200
                ${isActive ? "bg-teal-50" : ""}
              `}>
                <Icon className="w-6 h-6" />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
                )}
              </div>
              
              <span className={`
                text-[11px] font-semibold transition-all duration-200
                ${isActive ? "text-teal-600" : "text-slate-400"}
              `}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function useProgressCodeFromLocation(pathname: string): string | null {
  const [progressCode, setProgressCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProgressCode(params.get("code") ?? params.get("student"));
  }, [pathname]);

  return progressCode;
}
