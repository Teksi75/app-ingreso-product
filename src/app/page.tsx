import { loadProgressAsync, type StoredProgress } from "@/storage/local_progress_store";
import {
  BottomNav,
  SidebarNav,
  ProgressCircle,
  BentoCard,
  StreakBadge,
  XpBar,
  Button,
} from "@/components/ui";
import { ClientStudentName } from "@/components/dashboard/ClientStudentName";
import { ClientAvatarHero } from "@/components/dashboard/ClientAvatarHero";
import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
} from "@/progress/mastery_model";
import { getNextStepRecommendation } from "@/recommendation/next_step";
import { getWeakestPracticeSkillId } from "@/storage/local_progress_store";
import { canonicalIdToSlug } from "@/skills/skill_slugs";
import { getSkillMetadata } from "@/skills/skill_metadata";

export const dynamic = "force-dynamic";

function getRank(level: number): string {
  if (level >= 15) return "Maestro";
  if (level >= 10) return "Experto";
  if (level >= 7) return "Estudiante Dedicado";
  if (level >= 4) return "Aprendiz";
  return "Principiante";
}

function calculateDashboardData(progress: StoredProgress) {
  const model = buildMasteryModel(progress);
  const recommendation = getNextStepRecommendation(progress);
  const sessions = progress.sessions;
  const totalAttempts = sessions.reduce((sum, s) => sum + s.total_attempts, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.total_correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const level = Math.max(1, Math.floor(totalAttempts / 20) + 1);
  const xp = totalAttempts * 10;
  const xpToNextLevel = level * 200;

  const sessionDates = Array.from(new Set(sessions.map((s) => s.created_at.slice(0, 10))));
  const streak = sessionDates.length;
  const activeDays = sessionDates.length;

  const today = new Date().toISOString().slice(0, 10);
  const todayAttempts = sessions
    .filter((s) => s.created_at.slice(0, 10) === today)
    .reduce((sum, s) => sum + s.total_attempts, 0);
  const dailyProgress = Math.min(100, todayAttempts * 10);

  const lenguaSkillSummaries = CANONICAL_LENGUA_SKILLS
    .map((skillId) => model.skills[skillId])
    .filter((skill) => Boolean(skill));
  const lenguaProgress = lenguaSkillSummaries.length > 0
    ? Math.round(lenguaSkillSummaries.reduce((sum, skill) => sum + skill.masteryScore, 0) / lenguaSkillSummaries.length)
    : 0;
  const lenguaLevel = lenguaSkillSummaries.length > 0
    ? Math.max(1, Math.round(lenguaSkillSummaries.reduce((sum, skill) => sum + skill.masteryLevel, 0) / lenguaSkillSummaries.length))
    : 1;
  const weakestSkillId = getWeakestPracticeSkillId([...CANONICAL_LENGUA_SKILLS], progress);
  const weakestSkillHref = weakestSkillId
    ? `/practice?mode=training&skill=${encodeURIComponent(canonicalIdToSlug(weakestSkillId))}`
    : `/practice?mode=training&skill=${encodeURIComponent(canonicalIdToSlug("lengua.skill_1"))}`;
  const simulatorReady = model.simulatorReadiness.ready;

  return {
    student: {
      name: "Estudiante",
      level,
      rank: getRank(level),
      streak,
      dailyProgress,
      xp,
      xpToNextLevel,
    },
    skills: [
      {
        id: "math",
        name: "Matemática",
        progress: 0,
        level: 1,
        currentXp: 0,
        totalXp: 1000,
        description: "Números, operaciones y lógica",
        practiceHref: "",
        isAvailable: false,
      },
      {
        id: "language",
        name: "Lengua",
        progress: lenguaProgress,
        level: lenguaLevel,
        currentXp: xp,
        totalXp: 1000,
        description: "Comprensión lectora y gramática",
        practiceHref: weakestSkillHref,
        isAvailable: true,
      },
    ],
    dailyChallenge: {
      title: recommendation.title,
      description: recommendation.description,
      reason: recommendation.reason,
      ctaLabel: recommendation.ctaLabel,
      reward: 150,
      difficulty: recommendation.kind === "simulator-ready" ? "Simulador" : "Lengua",
      href: recommendation.href,
    },
    nextSimulation: {
      title: "Simulacro",
      date: simulatorReady ? "Listo para iniciar" : "En preparación",
      duration: model.simulatorReadiness.reason,
      topics: ["Lengua"],
      href: "/simulaciones",
    },
    weeklyProgress: {
      daysCompleted: Math.min(7, activeDays),
      totalDays: 7,
      exercisesDone: totalAttempts,
      averageScore: accuracy,
    },
    stats: {
      totalAttempts,
      totalCorrect,
      accuracy,
      activeDays,
    },
    weakestSkillHref,
    skillProgress: CANONICAL_LENGUA_SKILLS.map((skillId) => {
      const summary = model.skills[skillId];
      return {
        skillId,
        masteryLevel: summary?.masteryLevel ?? 1,
        totalAttempts: summary?.totalAttempts ?? 0,
        state: summary?.state ?? "weak",
      };
    }),
    recentSessionsCount: sessions.length,
  };
}

const MathIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const LanguageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

type HomePageProps = {
  searchParams: Promise<{
    newStudent?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const progress = isEnabledParam(newStudent) ? createEmptyProgress() : await loadProgressAsync();
  const { student, skills, dailyChallenge, nextSimulation, weeklyProgress, stats, weakestSkillHref, skillProgress, recentSessionsCount } =
    calculateDashboardData(progress);
  const hasPracticeHistory = stats.totalAttempts > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop only */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-screen pb-24 lg:pb-0">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-2xl">
                  🎓
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold text-slate-500">
                    {hasPracticeHistory ? "Tu entrenamiento" : "Primera práctica"}
                  </p>
                  <h1 className="m-0 text-lg font-bold text-slate-800"><ClientStudentName fallback={student.name} /></h1>
                </div>
              </div>
              <StreakBadge days={student.streak} size="md" />
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block bg-white border-b border-slate-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-800">
                {hasPracticeHistory ? "Bienvenido de vuelta" : "¡Empecemos!"}, <ClientStudentName fallback={student.name} />
              </h1>
              <StreakBadge days={student.streak} size="lg" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* TOP: Progreso + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {/* Progreso del Día */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <ProgressCircle
                    progress={student.dailyProgress}
                    size={130}
                    strokeWidth={12}
                    color="primary"
                  />
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                      Progreso del Día
                    </h2>
                    <p className="text-slate-500 mb-4 text-sm lg:text-base">
                      {stats.totalAttempts > 0
                        ? `Has completado ${stats.totalAttempts} ejercicios con ${stats.accuracy}% de precisión.`
                        : "Empieza tu entrenamiento hoy para ver tu progreso."}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Button href={weakestSkillHref} variant="primary" size="md" icon={<span>⚡</span>}>
                        {stats.totalAttempts > 0 ? "Continuar Lengua" : "Iniciar Entrenamiento"}
                      </Button>
                      <Button href={dailyChallenge.href} variant="secondary" size="md">
                        Ver Desafío
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* XP y Stats */}
            <div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <XpBar
                  level={student.level}
                  currentXp={student.xp}
                  xpToNextLevel={student.xpToNextLevel}
                  rank={student.rank}
                />
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-teal-50 rounded-xl">
                    <div className="text-2xl font-bold text-teal-600">{stats.totalAttempts}</div>
                    <div className="text-xs text-teal-600/70 font-medium">Ejercicios</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">{stats.accuracy}%</div>
                    <div className="text-xs text-orange-600/70 font-medium">Precisión</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HABILIDADES */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Habilidades Recomendadas</h2>
              <a
                href="/habilidades"
                className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center gap-1"
              >
                Ver todas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <BentoCard
                  key={skill.id}
                  accentColor={index === 0 ? "teal" : index === 1 ? "violet" : "orange"}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                      ${index === 0 ? "bg-teal-50 text-teal-600" : "bg-violet-50 text-violet-600"}
                    `}
                    >
                      {index === 0 ? <MathIcon /> : <LanguageIcon />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-slate-800 text-base">{skill.name}</h3>
                        <span
                          className={`
                          px-2 py-0.5 rounded-full text-xs font-bold
                          ${index === 0 ? "bg-teal-100 text-teal-700" : "bg-violet-100 text-violet-700"}
                        `}
                        >
                          Nv. {skill.level}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2 truncate">{skill.description}</p>

                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-slate-500">Progreso</span>
                          <span className="text-xs font-bold text-slate-700">{skill.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${index === 0 ? "bg-teal-500" : "bg-violet-500"}`}
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        disabled={!skill.isAvailable}
                        fullWidth
                        href={skill.practiceHref}
                        size="sm"
                        variant={index === 0 ? "secondary" : "primary"}
                        className={`
                        w-full py-2 rounded-lg text-sm font-semibold text-white
                        ${index === 0 ? "bg-slate-200 text-slate-500 shadow-none hover:bg-slate-200" : "bg-violet-500 hover:bg-violet-600 shadow-violet-200"}
                      `}
                      >
                        {skill.isAvailable ? "Entrenar" : "Próximamente"}
                      </Button>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>
          </div>

          {/* MIDDLE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {/* Desafío */}
            <BentoCard
              title={dailyChallenge.title}
              subtitle="Siguiente paso recomendado"
              accentColor="orange"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              action={
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  +{dailyChallenge.reward} XP
                </span>
              }
            >
              <p className="text-slate-600 mb-3 text-sm">{dailyChallenge.description}</p>
              <p className="mb-3 text-xs font-medium leading-5 text-slate-500">{dailyChallenge.reason}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                  {dailyChallenge.difficulty}
                </span>
                <Button href={dailyChallenge.href} variant="accent" size="sm">
                  {dailyChallenge.ctaLabel}
                </Button>
              </div>
            </BentoCard>

            {/* Simulación */}
            <BentoCard
              title="Próxima Simulación"
              subtitle={nextSimulation.date}
              accentColor="violet"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {nextSimulation.duration}
                </div>
                <div className="flex flex-wrap gap-1">
                  {nextSimulation.topics.map((topic) => (
                    <span key={topic} className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded">
                      {topic}
                    </span>
                  ))}
                </div>
                <Button href={nextSimulation.href} variant="secondary" size="sm" fullWidth className="mt-2">
                  Ver detalles
                </Button>
              </div>
            </BentoCard>

            {/* Progreso Semanal */}
            <BentoCard
              title="Progreso Semanal"
              subtitle={`${weeklyProgress.daysCompleted} de ${weeklyProgress.totalDays} días`}
              accentColor="emerald"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
                    <div
                      key={day}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                        ${i < weeklyProgress.daysCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-slate-800">{weeklyProgress.exercisesDone}</div>
                    <div className="text-xs text-slate-500">Ejercicios</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-slate-800">{weeklyProgress.averageScore}%</div>
                    <div className="text-xs text-slate-500">Promedio</div>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* BOTTOM: Avatar + Reporte */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Avatar */}
            <BentoCard
              title="Tu Avatar"
              subtitle="Personaliza tu héroe de aprendizaje"
              accentColor="teal"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <ClientAvatarHero level={student.level} rank={student.rank} energy={85} />

                <div className="flex-1 w-full sm:w-auto">
                  <div className="bg-gradient-to-r from-teal-50 to-violet-50 rounded-xl p-4 mb-3">
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-bold text-teal-600">¡Sigue así!</span> Has completado
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-800">{stats.totalAttempts}</span>
                      <span className="text-slate-600">ejercicios en total</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button href="/perfil" variant="secondary" size="sm" fullWidth>
                      Personalizar
                    </Button>
                    <Button href="/progreso" variant="ghost" size="sm">
                      Logros
                    </Button>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Reporte de Progreso */}
            <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-violet-50 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 text-slate-800">Reporte de Progreso</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Estadísticas reales de entrenamiento y práctica. Sin datos personales ni predicciones.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/80 border border-teal-100 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-teal-600">{stats.activeDays}</div>
                      <div className="text-xs text-slate-500">Días</div>
                    </div>
                    <div className="bg-white/80 border border-violet-100 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-violet-600">{stats.totalAttempts}</div>
                      <div className="text-xs text-slate-500">Ejercicios</div>
                    </div>
                    <div className="bg-white/80 border border-orange-100 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-orange-600">{stats.accuracy}%</div>
                      <div className="text-xs text-slate-500">Precisión</div>
                    </div>
                  </div>
                  {recentSessionsCount > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Progreso por habilidad</p>
                      <div className="grid gap-2">
                        {skillProgress.filter((s) => s.totalAttempts > 0).map((s) => {
                          const meta = getSkillMetadata(s.skillId);
                          const pct = Math.round((s.masteryLevel / 4) * 100);
                          return (
                            <div className="flex items-center gap-2" key={s.skillId}>
                              <span className="text-xs font-medium text-slate-600 w-32 truncate">{meta.title}</span>
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    s.masteryLevel >= 3 ? "bg-emerald-400" : s.masteryLevel === 2 ? "bg-amber-400" : "bg-rose-400"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-500 w-6 text-right">Nv.{s.masteryLevel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <p className="text-xs text-slate-400">
                    {recentSessionsCount > 0
                      ? `Basado en ${recentSessionsCount} sesión${recentSessionsCount !== 1 ? "es" : ""} de práctica, lectura y simulador.`
                      : "Sin sesiones registradas todavía."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

function createEmptyProgress(): StoredProgress {
  return {
    sessions: [],
    seenSkills: [],
    skill_stats: {},
  };
}

function isEnabledParam(value: string | undefined): boolean {
  return value === "1" || value === "true";
}
