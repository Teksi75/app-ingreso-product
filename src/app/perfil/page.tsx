"use client";

/**
 * Perfil - Página de Configuración y Perfil del Usuario
 * =====================================================
 * Avatar personalizable, estadísticas generales y configuración.
 */

import { useState } from "react";
import {
  BottomNav,
  SidebarNav,
  Button,
  AvatarHero,
} from "@/components/ui";

const AVATAR_OPTIONS = ["🎓", "👩‍🎓", "👨‍🎓", "🧑‍🔬", "👩‍🔬", "🦸", "🦹", "🧙", "🧝", "🧛"];

const SETTINGS = [
  { id: "notifications", label: "Notificaciones", description: "Recibir recordatorios diarios", enabled: true },
  { id: "sound", label: "Sonidos", description: "Efectos de sonido en la app", enabled: true },
  { id: "darkMode", label: "Modo Oscuro", description: "Cambiar apariencia", enabled: false },
  { id: "parentReports", label: "Reportes a Padres", description: "Enviar reportes semanales automáticamente", enabled: true },
];

export default function PerfilPage() {
  const [selectedAvatar, setSelectedAvatar] = useState("🎓");
  const [settings, setSettings] = useState(SETTINGS);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-800">Mi Perfil</h1>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-xl">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block bg-white border-b border-slate-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
              <Button variant="secondary" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Avatar & Info */}
            <div className="space-y-6">
              {/* Avatar Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
                <AvatarHero
                  name="Sofía"
                  level={7}
                  rank="Estudiante Dedicada"
                  energy={85}
                />
                
                {/* Avatar Selector */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-600 mb-3">Cambiar Avatar</p>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`
                          w-10 h-10 rounded-xl text-xl flex items-center justify-center
                          transition-all duration-200
                          ${selectedAvatar === avatar 
                            ? "bg-teal-100 ring-2 ring-teal-500" 
                            : "bg-slate-50 hover:bg-slate-100"
                          }
                        `}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Miembro desde</span>
                    <span className="font-semibold">Enero 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Días activa</span>
                    <span className="font-semibold">45 días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ejercicios totales</span>
                    <span className="font-semibold">359</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Logros</span>
                    <span className="font-semibold">3 de 12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      value="Sofía"
                      readOnly
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value="sofia@ejemplo.com"
                      readOnly
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Edad</label>
                    <input
                      type="text"
                      value="12 años"
                      readOnly
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Escuela</label>
                    <input
                      type="text"
                      value="Escuela Primaria #42"
                      readOnly
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Configuración</h3>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{setting.label}</p>
                        <p className="text-sm text-slate-500">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.id)}
                        className={`
                          w-12 h-6 rounded-full transition-colors relative
                          ${setting.enabled ? "bg-teal-500" : "bg-slate-300"}
                        `}
                      >
                        <span
                          className={`
                            absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                            ${setting.enabled ? "left-7" : "left-1"}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Access */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                <h3 className="font-bold text-lg mb-2">Acceso para Padres</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Comparte el código con tus padres para que puedan ver tu progreso.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 font-mono text-lg tracking-wider">
                    ING-7842-SOF
                  </div>
                  <Button variant="secondary" size="sm">
                    Copiar
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">Zona de Peligro</h3>
                <p className="text-red-600 text-sm mb-4">
                  Estas acciones no se pueden deshacer.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                    Borrar Progreso
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
