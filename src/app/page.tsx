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
import { ClientAvatarBadge } from "@/components/dashboard/ClientAvatarBadge";
import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
} from "@/progress/mastery_model";
import { getNextStepRecommendation } from "@/recommendation/next_step";
import { getWeakestPracticeSkillId } from "@/storage/local_progress_store";
import { canonicalIdToSlug } from "@/skills/skill_slugs";
import { getSkillMetadata } from "@/skills/skill_metadata";
import { resolveStudentCode } from "@/app/student_identity";
import { withProgressCode } from "@/app/progress_code_href";

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
    simulatorReady,
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
    code?: string | string[];
    newStudent?: string | string[];
    student?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const explicitCode = getParam(params.code) ?? getParam(params.student);
  const studentCode = await resolveStudentCode(explicitCode);
  const progressCode = explicitCode ? studentCode : undefined;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const progress = isEnabledParam(newStudent) ? createEmptyProgress() : await loadProgressAsync(studentCode);
  const { student, skills, dailyChallenge, nextSimulation, weeklyProgress, stats, weakestSkillHref, skillProgress, recentSessionsCount, simulatorReady } =
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
                  <ClientAvatarBadge />
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
          {/* TU MISIÓN DE HOY - Bloque principal */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">🎯</div>
                <div className="flex-1">
                  <h2 className="text-xl lg:text-2xl font-bold mb-2">Tu misión de hoy</h2>
                  <p className="text-teal-100 text-sm lg:text-base">
                    Tenés que mejorar en:
                  </p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👉</span>
                  <div>
                    <h3 className="font-bold text-lg">{dailyChallenge.title}</h3>
                    <p className="text-teal-100 text-sm">{dailyChallenge.description}</p>
                  </div>
                </div>
                <p className="text-teal-200 text-xs mt-2">
                  {dailyChallenge.reason}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button 
                  href={withProgressCode(dailyChallenge.href, progressCode)} 
                  variant="secondary" 
                  size="lg"
                  className="flex-1 bg-white text-teal-600 hover:bg-teal-50 font-bold"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>⚡</span>
                    Practicar ahora
                  </span>
                </Button>
                <div className="text-center sm:text-right">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    +{dailyChallenge.reward} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen rápido de progreso */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.totalAttempts}</div>
              <div className="text-xs text-slate-500">Ejercicios</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.accuracy}%</div>
              <div className="text-xs text-slate-500">Precisión</div>
              {stats.accuracy < 70 && stats.totalAttempts > 0 && (
                <div className="text-xs text-orange-500 mt-1">🔻 Te falta poco para el 70%</div>
              )}
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
              <div className="text-2xl font-bold text-violet-600">{student.streak}</div>
              <div className="text-xs text-slate-500">Días activos</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
              <div className="text-2xl font-bold text-emerald-600">{student.level}</div>
              <div className="text-xs text-slate-500">Nivel</div>
            </div>
          </div>

          {/* Habilidades - Versión simplificada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Fortalezas */}
            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="text-emerald-500">💪</span> Vas bien:
              </h3>
              <div className="space-y-2">
                {skillProgress.filter(s => s.masteryLevel >= 3).length > 0 ? (
                  skillProgress.filter(s => s.masteryLevel >= 3).slice(0, 3).map((skill) => {
                    const meta = getSkillMetadata(skill.skillId);
                    return (
                      <div key={skill.skillId} className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-500">✔</span>
                        <span className="text-slate-700">{meta.title}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>🌱</span>
                    <span>¡Empezá a practicar para ver tus fortalezas!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Áreas de mejora */}
            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="text-amber-500">⚠️</span> Tenés que mejorar:
              </h3>
              <div className="space-y-2">
                {skillProgress.filter(s => s.masteryLevel <= 2).length > 0 ? (
                  skillProgress.filter(s => s.masteryLevel <= 2).slice(0, 3).map((skill) => {
                    const meta = getSkillMetadata(skill.skillId);
                    return (
                      <div key={skill.skillId} className="flex items-center gap-2 text-sm">
                        <span className="text-amber-500">→</span>
                        <span className="text-slate-700">{meta.title}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>🎯</span>
                    <span>Todo bien por ahora, seguí practicando</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE GRID - Simulación + Progreso Semanal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
            {/* Simulación - Versión con urgencia */}
            <BentoCard
              title={simulatorReady ? "Simulación lista" : "Simulación bloqueada"}
              subtitle={simulatorReady ? "Podés empezar ahora" : "Tenés que practicar más"}
              accentColor={simulatorReady ? "emerald" : "orange"}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <div className="space-y-3">
                {simulatorReady ? (
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                      <span>✅</span>
                      <span>¡Listo para simular!</span>
                    </div>
                    <p className="text-emerald-600 text-xs mt-1">10 preguntas • 15 min</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                      <span>🔒</span>
                      <span>Te faltan habilidades para desbloquearla</span>
                    </div>
                    <p className="text-amber-600 text-xs mt-1">Practicá más para acceder al simulador</p>
                  </div>
                )}
                <Button 
                  href={withProgressCode(nextSimulation.href, progressCode)} 
                  variant={simulatorReady ? "primary" : "secondary"} 
                  size="sm" 
                  fullWidth
                  disabled={!simulatorReady}
                >
                  {simulatorReady ? "Empezar simulación" : "Ver qué me falta"}
                </Button>
              </div>
            </BentoCard>

            {/* Progreso Semanal con contexto */}
            <BentoCard
              title="Tu ritmo semanal"
              subtitle={
                weeklyProgress.daysCompleted >= 5 
                  ? "Buen ritmo 👍" 
                  : weeklyProgress.daysCompleted >= 3 
                    ? "Podés mejorar" 
                    : "Te faltan días de práctica"
              }
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

          {/* Avatar compacto en esquina */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <Button 
                href={withProgressCode("/perfil", progressCode)} 
                variant="ghost" 
                size="sm"
                className="text-slate-500 hover:text-teal-600"
              >
                <span className="flex items-center gap-2">
                  <span>👤</span>
                  Personalizar perfil
                </span>
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-violet-50 rounded-xl p-3 border border-teal-100 flex items-center gap-3">
              <div className="text-2xl">
                <ClientAvatarBadge />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Nv. {student.level}</div>
                <div className="text-xs text-slate-500">{student.rank}</div>
              </div>
            </div>
          </div>

          {/* Enlace a reporte completo */}
          <div className="mt-6 text-center">
            <Button 
              href={withProgressCode("/progreso", progressCode)} 
              variant="ghost" 
              size="sm"
              className="text-slate-500 hover:text-teal-600"
            >
              <span className="flex items-center gap-2">
                <span>📊</span>
                Ver reporte completo
              </span>
            </Button>
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

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
