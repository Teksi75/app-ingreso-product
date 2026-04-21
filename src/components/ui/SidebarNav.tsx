"use client";

/**
 * SidebarNav - Navegación lateral para Desktop
 * =============================================
 * Barra de navegación lateral para pantallas grandes con Next.js Link.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

const navItems = [
  { id: "home", label: "Inicio", href: "/" },
  { id: "skills", label: "Habilidades", href: "/habilidades" },
  { id: "simulator", label: "Simulaciones", href: "/simulaciones" },
  { id: "progress", label: "Progreso", href: "/progreso" },
  { id: "profile", label: "Perfil", href: "/perfil" },
];

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

export function SidebarNav() {
  const pathname = usePathname();
  const { profile } = useProfile();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-200">
            I
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">INGENIUM</h1>
            <p className="text-xs text-slate-400">Preparación Ingreso</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = iconMap[item.id];
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                font-semibold text-sm transition-all duration-200
                ${isActive 
                  ? "bg-teal-50 text-teal-600 border-l-4 border-teal-500" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-teal-500" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User mini profile */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-lg">
            {profile.avatar || "🎓"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{profile.name}</p>
            <p className="text-xs text-slate-500">Nivel 7</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
