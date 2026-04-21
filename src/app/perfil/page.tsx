"use client";

/**
 * Perfil - Página de Configuración y Perfil del Usuario
 * =====================================================
 * Avatar personalizable, estadísticas generales y configuración.
 * Solo el Nombre es obligatorio; Email, Edad y Escuela son opcionales.
 */

import { useState, useEffect } from "react";
import {
  BottomNav,
  SidebarNav,
  Button,
  AvatarHero,
} from "@/components/ui";
import { useProfile } from "@/hooks/useProfile";

const AVATAR_OPTIONS = ["🎓", "👩‍🎓", "👨‍🎓", "🧑‍🔬", "👩‍🔬", "🦸", "🦹", "🧙", "🧝", "🧛"];

const SETTINGS = [
  { id: "notifications", label: "Notificaciones", description: "Recibir recordatorios diarios", enabled: true },
  { id: "sound", label: "Sonidos", description: "Efectos de sonido en la app", enabled: true },
  { id: "darkMode", label: "Modo Oscuro", description: "Cambiar apariencia", enabled: false },
  { id: "parentReports", label: "Reportes a Padres", description: "Enviar reportes semanales automáticamente", enabled: true },
];

export default function PerfilPage() {
  const { profile, setProfile, isLoaded } = useProfile();
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    school: "",
    avatar: "🎓",
  });
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(SETTINGS);

  // Sincronizar formulario con el perfil cargado
  useEffect(() => {
    if (isLoaded) {
      setForm({
        name: profile.name === "Estudiante" ? "" : profile.name,
        email: profile.email || "",
        age: profile.age || "",
        school: profile.school || "",
        avatar: profile.avatar || "🎓",
      });
    }
  }, [isLoaded, profile]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) {
      // Si el nombre está vacío, no guardar y mostrar feedback visual
      return;
    }
    setProfile({
      name,
      email: form.email.trim() || undefined,
      age: form.age.trim() || undefined,
      school: form.school.trim() || undefined,
      avatar: form.avatar,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isNameEmpty = form.name.trim() === "";

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
                {profile.avatar || "👤"}
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
                  name={profile.name}
                  level={7}
                  rank="Estudiante Dedicada"
                  energy={85}
                  emoji={form.avatar}
                />
                
                {/* Avatar Selector */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-600 mb-3">Cambiar Avatar</p>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => handleChange("avatar", avatar)}
                        className={`
                          w-10 h-10 rounded-xl text-xl flex items-center justify-center
                          transition-all duration-200
                          ${form.avatar === avatar 
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Información Personal</h3>
                  {saved && (
                    <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      ¡Guardado!
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Tu nombre"
                      className={`
                        w-full px-4 py-2 rounded-xl border text-slate-800
                        focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${isNameEmpty 
                          ? "border-red-300 bg-red-50 focus:ring-red-400" 
                          : "border-slate-200 bg-white"
                        }
                      `}
                    />
                    {isNameEmpty && (
                      <p className="text-xs text-red-500 mt-1">El nombre es obligatorio</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Edad</label>
                    <input
                      type="text"
                      value={form.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Escuela</label>
                    <input
                      type="text"
                      value={form.school}
                      onChange={(e) => handleChange("school", e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isNameEmpty}
                    className={isNameEmpty ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Guardar Cambios
                  </Button>
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
