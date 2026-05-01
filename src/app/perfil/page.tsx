"use client";

/**
 * Perfil - identidad local del estudiante
 * =======================================
 * Guarda solo alias, avatar y preferencias pedagogicas en el navegador.
 * No captura datos privados ni crea una cuenta asociada al Instituto.
 */

import { useEffect, useMemo, useState } from "react";
import { AvatarHero, BottomNav, Button, SidebarNav } from "@/components/ui";
import { useProfile, type LearningGoal, type PreferredSubject } from "@/hooks/useProfile";

const AVATAR_OPTIONS = ["🦊", "🐼", "🐧", "🐯", "🦉", "⭐", "🏆", "📚", "✏️", "🚀"];

const LEARNING_GOALS: Array<{ id: LearningGoal; label: string; description: string }> = [
  {
    id: "daily_practice",
    label: "Practicar cada dia",
    description: "Mantener ritmo y constancia con sesiones cortas.",
  },
  {
    id: "exam_training",
    label: "Preparar el examen",
    description: "Priorizar simulacros, dominio y control de errores.",
  },
  {
    id: "strengthen_weak_skills",
    label: "Reforzar puntos debiles",
    description: "Concentrar el entrenamiento en habilidades con mas dificultad.",
  },
];

const SUBJECTS: Array<{ id: PreferredSubject; label: string }> = [
  { id: "lengua", label: "Lengua" },
  { id: "matematica", label: "Matematica" },
  { id: "ambas", label: "Ambas" },
];

const SETTING_LABELS = {
  localReminders: {
    label: "Recordatorios locales",
    description: "Mostrar avisos en este dispositivo cuando la app lo permita.",
  },
  sound: {
    label: "Sonidos",
    description: "Usar efectos de audio durante la practica.",
  },
  reducedMotion: {
    label: "Reducir movimiento",
    description: "Disminuir animaciones de la interfaz.",
  },
};

export default function PerfilPage() {
  const { profile, setProfile, resetProfile, isLoaded } = useProfile();
  const [form, setForm] = useState({
    name: "",
    avatar: "🦊",
    learningGoal: "daily_practice" as LearningGoal,
    preferredSubject: "lengua" as PreferredSubject,
  });
  const [settings, setSettings] = useState(profile.settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    setForm({
      name: profile.name === "Estudiante" ? "" : profile.name,
      avatar: profile.avatar || "🦊",
      learningGoal: profile.learningGoal,
      preferredSubject: profile.preferredSubject,
    });
    setSettings(profile.settings);
  }, [isLoaded, profile]);

  const memberSince = useMemo(() => {
    return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(
      new Date(profile.createdAt),
    );
  }, [profile.createdAt]);

  const handleSave = () => {
    setProfile({
      name: form.name.trim() || "Estudiante",
      avatar: form.avatar,
      learningGoal: form.learningGoal,
      preferredSubject: form.preferredSubject,
      settings,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateForm = <Key extends keyof typeof form>(field: Key, value: (typeof form)[Key]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleSetting = (id: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleReset = () => {
    resetProfile();
    setSaved(false);
  };

  const displayName = form.name.trim() || "Estudiante";

  if (!isLoaded) {
    return (
      <div className="min-h-screen dashboard-shell flex">
        <SidebarNav />
        <main className="flex-1 min-w-0 min-h-screen">
          <section className="mx-auto grid max-w-3xl gap-4 p-4 lg:p-6">
            <div className="panel-pastel p-6">
              <p className="m-0 text-sm font-semibold text-slate-600">Cargando perfil local...</p>
            </div>
          </section>
        </main>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-shell flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 min-h-screen pb-24 lg:pb-0">
        <header className="lg:hidden glass-subtle border-b border-white/70">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-900">Mi Perfil</h1>
              <div className="w-11 h-11 rounded-2xl gradient-ingenium flex items-center justify-center text-xl shadow-soft-sm">
                {form.avatar}
              </div>
            </div>
          </div>
        </header>

        <header className="hidden lg:block glass-subtle border-b border-white/70">
          <div className="px-6 py-5 xl:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Identidad INGENIUM</p>
                <h1 className="text-2xl font-extrabold text-slate-900">Mi Perfil</h1>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Perfil local
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:px-6 lg:p-10">
          <section className="gradient-mission relative overflow-hidden rounded-[2.25rem] p-6 text-white shadow-soft-lg sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/18 text-5xl shadow-soft-sm ring-1 ring-white/25">
                  {form.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">Perfil local</p>
                  <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{displayName}</h2>
                  <p className="mt-1 text-sm text-white/82">Nivel 1 · Entrenamiento activo · Perfil privado en este dispositivo</p>
                </div>
              </div>
              <Button variant="secondary" size="lg" onClick={handleSave} className="bg-white text-violet-700 hover:bg-violet-50 font-bold shadow-soft-md">
                Guardar perfil
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="order-1 space-y-8 lg:order-1 lg:col-span-2">
              <div className="panel-pastel p-6 lg:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-900">Identidad local</h3>
                  {saved && (
                    <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      Guardado
                    </span>
                  )}
                </div>

                <div className="space-y-7">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Alias</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      placeholder="Estudiante"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usa un apodo. No hace falta nombre real, email, edad ni escuela.
                    </p>
                  </div>

                  <div>
                    <p className="block text-sm font-medium text-slate-600 mb-2">Objetivo</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {LEARNING_GOALS.map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => updateForm("learningGoal", goal.id)}
                          className={`rounded-2xl border p-5 text-left shadow-soft-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                            form.learningGoal === goal.id
                              ? "border-teal-500 bg-teal-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span className="block font-semibold text-slate-800">{goal.label}</span>
                          <span className="mt-1 block text-xs text-slate-500">{goal.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="block text-sm font-medium text-slate-600 mb-2">Materia prioritaria</p>
                    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-soft-sm">
                      {SUBJECTS.map((subject) => (
                        <button
                          key={subject.id}
                          type="button"
                          onClick={() => updateForm("preferredSubject", subject.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                            form.preferredSubject === subject.id
                              ? "bg-white text-teal-700 shadow-soft-sm"
                              : "text-slate-600 hover:text-slate-800"
                          }`}
                        >
                          {subject.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
                  <Button variant="primary" size="md" onClick={handleSave} className="rounded-2xl shadow-soft-md">
                    Guardar perfil
                  </Button>
                </div>
              </div>

              <div className="panel-pastel p-6 lg:p-7">
                <h3 className="mb-5 text-xl font-extrabold text-slate-900">Preferencias locales</h3>
                <div className="space-y-4">
                  {Object.entries(SETTING_LABELS).map(([id, copy]) => (
                    <div key={id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                      <div>
                        <p className="font-medium text-slate-800">{copy.label}</p>
                        <p className="text-sm text-slate-500">{copy.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSetting(id as keyof typeof settings)}
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          settings[id as keyof typeof settings] ? "bg-teal-500" : "bg-slate-300"
                        }`}
                        aria-pressed={settings[id as keyof typeof settings]}
                        aria-label={copy.label}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            settings[id as keyof typeof settings] ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-pastel p-6 lg:p-7">
                <h3 className="mb-2 text-xl font-extrabold text-slate-900">Gestión de datos</h3>
                <p className="mb-5 text-sm text-slate-600">
                  El perfil vive en este dispositivo. INGENIUM no necesita recibirlo para que la app funcione.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button href="/progreso" variant="secondary" size="sm">
                    Ver progreso
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Restablecer perfil local
                  </button>
                </div>
              </div>
            </div>

            <div className="order-2 space-y-8 lg:order-2">
              <div className="panel-pastel p-7 text-center">
                <AvatarHero
                  name={displayName}
                  level={1}
                  rank="Entrenamiento activo"
                  energy={85}
                  emoji={form.avatar}
                />

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <p className="mb-4 text-base font-extrabold text-slate-700">Elegí tu avatar</p>
                  <div className="grid grid-cols-5 gap-4">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        aria-pressed={form.avatar === avatar}
                        data-avatar={avatar}
                        data-testid={`avatar-option-${AVATAR_OPTIONS.indexOf(avatar)}`}
                        onClick={() => updateForm("avatar", avatar)}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                          form.avatar === avatar
                            ? "bg-teal-100 ring-2 ring-teal-500 shadow-soft-sm"
                            : "bg-white/80 shadow-soft-sm hover:bg-slate-50"
                        }`}
                        aria-label={`Elegir avatar ${avatar}`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel-pastel p-6">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">🔐 Privacidad</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4 rounded-2xl bg-emerald-50 p-3">
                    <span>Datos personales</span>
                    <span className="font-semibold text-emerald-700">No guardados</span>
                  </div>
                  <div className="flex justify-between gap-4 rounded-2xl bg-emerald-50 p-3">
                    <span>Sincronizacion con INGENIUM</span>
                    <span className="font-semibold text-emerald-700">Desactivada</span>
                  </div>
                  <div className="flex justify-between gap-4 rounded-2xl bg-white/80 p-3 shadow-soft-sm">
                    <span>Perfil creado</span>
                    <span className="font-semibold text-slate-800 capitalize">{memberSince}</span>
                  </div>
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
