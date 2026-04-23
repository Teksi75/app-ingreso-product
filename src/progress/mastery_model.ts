import type {
  PracticeProgressSnapshot,
  PracticeSkillProgress,
  SessionMode,
  SkillState,
  StoredProgress,
} from "../storage/local_progress_store.ts";

export const CANONICAL_LENGUA_SKILLS = [
  "lengua.skill_1",
  "lengua.skill_2",
  "lengua.skill_3",
  "lengua.skill_4",
  "lengua.skill_5",
  "lengua.skill_6",
  "lengua.skill_7",
] as const;

export type ProgressFocusEntry = {
  focusId: string;
  createdAt: string;
  sessionMode: SessionMode;
  attempts: number;
  correct: number;
  errors: number;
  reportedState: SkillState;
  reportedMasteryLevel: number;
};

export type FocusMasterySummary = {
  focusId: string;
  totalAttempts: number;
  totalCorrect: number;
  totalErrors: number;
  practiceSessions: number;
  readingSessions: number;
  simulatorSessions: number;
  weightedAccuracy: number;
  recentAccuracy: number;
  masteryScore: number;
  masteryLevel: 1 | 2 | 3 | 4;
  state: SkillState;
  lastSessionMode?: SessionMode;
  lastPracticedAt?: string;
  trace: string[];
};

export type SimulatorReadiness = {
  ready: boolean;
  eligibleSkillCount: number;
  weakSkillCount: number;
  averageMasteryScore: number;
  reason: string;
};

export type MasteryModel = {
  masteryByFocus: Record<string, 1 | 2 | 3 | 4>;
  practiceSkillStats: Record<string, PracticeSkillProgress>;
  skills: Record<string, FocusMasterySummary>;
  subskills: Record<string, FocusMasterySummary>;
  recentSessionModes: SessionMode[];
  lastSessionMode?: SessionMode;
  simulatorReadiness: SimulatorReadiness;
};

const MODE_WEIGHTS: Record<SessionMode, number> = {
  practice: 1,
  reading: 1.15,
  simulator: 1.25,
};

export function buildMasteryModel(progress: StoredProgress): MasteryModel {
  const sessions = [...(progress.sessions ?? [])].sort((left, right) => (
    left.created_at.localeCompare(right.created_at)
  ));
  const entriesByFocus = new Map<string, ProgressFocusEntry[]>();

  for (const session of sessions) {
    for (const skillResult of session.skill_results) {
      const focusId = skillResult.skill_id;
      const entries = entriesByFocus.get(focusId) ?? [];
      entries.push({
        focusId,
        createdAt: session.created_at,
        sessionMode: session.mode,
        attempts: skillResult.attempts,
        correct: skillResult.correct,
        errors: Math.max(0, skillResult.attempts - skillResult.correct),
        reportedState: skillResult.state,
        reportedMasteryLevel: clampMasteryLevel(skillResult.mastery_level),
      });
      entriesByFocus.set(focusId, entries);
    }
  }

  const skills: Record<string, FocusMasterySummary> = {};
  const subskills: Record<string, FocusMasterySummary> = {};
  const masteryByFocus: Record<string, 1 | 2 | 3 | 4> = {};

  for (const [focusId, entries] of entriesByFocus) {
    const summary = interpretFocusEntries(focusId, entries);
    masteryByFocus[focusId] = summary.masteryLevel;

    if (isCanonicalSkillId(focusId)) {
      skills[focusId] = summary;
    } else {
      subskills[focusId] = summary;
    }
  }

  const simulatorReadiness = evaluateSimulatorReadiness(skills, sessions.length);

  return {
    masteryByFocus,
    practiceSkillStats: buildPracticeSkillStats(skills),
    skills,
    subskills,
    recentSessionModes: sessions.slice(-3).map((session) => session.mode),
    lastSessionMode: sessions.at(-1)?.mode,
    simulatorReadiness,
  };
}

export function buildPracticeProgressSnapshot(progress: StoredProgress): PracticeProgressSnapshot {
  const model = buildMasteryModel(progress);

  return {
    seenSkills: [...(progress.seenSkills ?? [])],
    masteryByFocus: model.masteryByFocus,
    practiceSkillStats: model.practiceSkillStats,
  };
}

export function getWeakestSkillId(
  model: MasteryModel,
  skillIds: readonly string[],
): string | null {
  const weakest = [...skillIds]
    .map((skillId) => model.skills[skillId])
    .filter((skill): skill is FocusMasterySummary => Boolean(skill))
    .sort((left, right) => (
      getStatePriority(left.state) - getStatePriority(right.state) ||
      left.masteryScore - right.masteryScore ||
      left.recentAccuracy - right.recentAccuracy ||
      left.focusId.localeCompare(right.focusId)
    ))[0];

  return weakest?.focusId ?? null;
}

export function explainWeakestSkill(
  model: MasteryModel,
  skillIds: readonly string[],
): { skillId: string | null; reason: string } {
  const skillId = getWeakestSkillId(model, skillIds);

  if (!skillId) {
    return {
      skillId: null,
      reason: "Todavia no hay suficiente historial para detectar una skill debil.",
    };
  }

  const skill = model.skills[skillId];

  return {
    skillId,
    reason: skill?.trace[0] ?? "Es la skill con menor consolidacion segun el historial reciente.",
  };
}

function interpretFocusEntries(focusId: string, entries: ProgressFocusEntry[]): FocusMasterySummary {
  const sortedEntries = [...entries].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  const totalAttempts = sortedEntries.reduce((sum, entry) => sum + entry.attempts, 0);
  const totalCorrect = sortedEntries.reduce((sum, entry) => sum + entry.correct, 0);
  const totalErrors = totalAttempts - totalCorrect;
  const practiceSessions = sortedEntries.filter((entry) => entry.sessionMode === "practice").length;
  const readingSessions = sortedEntries.filter((entry) => entry.sessionMode === "reading").length;
  const simulatorSessions = sortedEntries.filter((entry) => entry.sessionMode === "simulator").length;
  const weightedEntries = sortedEntries.map((entry, index) => ({
    ...entry,
    weight: MODE_WEIGHTS[entry.sessionMode] * getRecencyWeight(index, sortedEntries.length),
  }));
  const weightedAttempts = weightedEntries.reduce((sum, entry) => sum + entry.attempts * entry.weight, 0);
  const weightedCorrect = weightedEntries.reduce((sum, entry) => sum + entry.correct * entry.weight, 0);
  const weightedAccuracy = weightedAttempts > 0 ? weightedCorrect / weightedAttempts : 0;
  const recentEntries = weightedEntries.slice(-3);
  const recentAttempts = recentEntries.reduce((sum, entry) => sum + entry.attempts * entry.weight, 0);
  const recentCorrect = recentEntries.reduce((sum, entry) => sum + entry.correct * entry.weight, 0);
  const recentAccuracy = recentAttempts > 0 ? recentCorrect / recentAttempts : weightedAccuracy;
  const reportedMastery = weightedEntries.reduce((sum, entry) => sum + entry.reportedMasteryLevel * entry.weight, 0);
  const weightedMastery = weightedAttempts > 0
    ? reportedMastery / weightedEntries.reduce((sum, entry) => sum + entry.weight, 0)
    : 1;
  const masteryScore = calculateMasteryScore({
    weightedAccuracy,
    recentAccuracy,
    weightedMastery,
    totalAttempts,
    readingSessions,
  });
  const masteryLevel = scoreToMasteryLevel(masteryScore, recentAccuracy, totalAttempts);
  const state = masteryLevelToState(masteryLevel);
  const trace = buildTrace({
    focusId,
    totalAttempts,
    weightedAccuracy,
    recentAccuracy,
    readingSessions,
    practiceSessions,
    simulatorSessions,
    masteryScore,
    masteryLevel,
  });

  return {
    focusId,
    totalAttempts,
    totalCorrect,
    totalErrors,
    practiceSessions,
    readingSessions,
    simulatorSessions,
    weightedAccuracy,
    recentAccuracy,
    masteryScore,
    masteryLevel,
    state,
    lastSessionMode: sortedEntries.at(-1)?.sessionMode,
    lastPracticedAt: sortedEntries.at(-1)?.createdAt,
    trace,
  };
}

function calculateMasteryScore({
  weightedAccuracy,
  recentAccuracy,
  weightedMastery,
  totalAttempts,
  readingSessions,
}: {
  weightedAccuracy: number;
  recentAccuracy: number;
  weightedMastery: number;
  totalAttempts: number;
  readingSessions: number;
}): number {
  const accuracyComponent = weightedAccuracy * 45;
  const recentComponent = recentAccuracy * 35;
  const masteryComponent = ((weightedMastery - 1) / 3) * 20;
  const readingBonus = readingSessions > 0 ? Math.min(5, readingSessions * 1.5) : 0;
  const consistencyBonus = totalAttempts >= 8 ? 5 : totalAttempts >= 4 ? 2 : 0;

  return clampScore(Math.round(accuracyComponent + recentComponent + masteryComponent + readingBonus + consistencyBonus));
}

function scoreToMasteryLevel(
  masteryScore: number,
  recentAccuracy: number,
  totalAttempts: number,
): 1 | 2 | 3 | 4 {
  if (masteryScore >= 82 && recentAccuracy >= 0.8 && totalAttempts >= 6) {
    return 4;
  }

  if (masteryScore >= 64 && recentAccuracy >= 0.7 && totalAttempts >= 4) {
    return 3;
  }

  if (masteryScore >= 42 && recentAccuracy >= 0.45 && totalAttempts >= 2) {
    return 2;
  }

  return 1;
}

function evaluateSimulatorReadiness(
  skills: Record<string, FocusMasterySummary>,
  totalSessions: number,
): SimulatorReadiness {
  const canonicalSkills = [...CANONICAL_LENGUA_SKILLS]
    .map((skillId) => skills[skillId])
    .filter((skill): skill is FocusMasterySummary => Boolean(skill));
  const eligibleSkillCount = canonicalSkills.filter((skill) => skill.totalAttempts >= 4 && skill.masteryLevel >= 2).length;
  const weakSkillCount = canonicalSkills.filter((skill) => skill.state === "weak").length;
  const averageMasteryScore = canonicalSkills.length > 0
    ? Math.round(canonicalSkills.reduce((sum, skill) => sum + skill.masteryScore, 0) / canonicalSkills.length)
    : 0;
  const ready = totalSessions >= 4 && eligibleSkillCount >= 4 && weakSkillCount === 0 && averageMasteryScore >= 60;

  return {
    ready,
    eligibleSkillCount,
    weakSkillCount,
    averageMasteryScore,
    reason: ready
      ? "Hay base suficiente en skills canonicas y no aparecen debilidades dominantes."
      : `Faltan skills consolidadas para simulador: ${eligibleSkillCount}/4 elegibles, ${weakSkillCount} debiles activas.`,
  };
}

function buildPracticeSkillStats(skills: Record<string, FocusMasterySummary>): Record<string, PracticeSkillProgress> {
  return Object.fromEntries(
    Object.values(skills).map((skill) => [
      skill.focusId,
      {
        skill_id: skill.focusId,
        total_attempts: skill.totalAttempts,
        total_correct: skill.totalCorrect,
        practice_sessions: skill.practiceSessions,
        last_state: skill.state,
        mastery_level: skill.masteryLevel,
      },
    ]),
  );
}

function buildTrace({
  focusId,
  totalAttempts,
  weightedAccuracy,
  recentAccuracy,
  readingSessions,
  practiceSessions,
  simulatorSessions,
  masteryScore,
  masteryLevel,
}: {
  focusId: string;
  totalAttempts: number;
  weightedAccuracy: number;
  recentAccuracy: number;
  readingSessions: number;
  practiceSessions: number;
  simulatorSessions: number;
  masteryScore: number;
  masteryLevel: number;
}): string[] {
  const modeTrace = `Impacto por modo: practice=${practiceSessions}, reading=${readingSessions}, simulator=${simulatorSessions}.`;

  return [
    `${focusId} queda en mastery ${masteryLevel} con score ${masteryScore}, accuracy ponderada ${formatPercent(weightedAccuracy)} y precision reciente ${formatPercent(recentAccuracy)}.`,
    modeTrace,
    `Intentos acumulados: ${totalAttempts}. Las sesiones mas recientes pesan mas que las antiguas.`,
  ];
}

function getRecencyWeight(index: number, total: number): number {
  const distanceFromEnd = total - index - 1;

  if (distanceFromEnd === 0) {
    return 1.35;
  }

  if (distanceFromEnd === 1) {
    return 1.2;
  }

  if (distanceFromEnd === 2) {
    return 1.1;
  }

  return 1;
}

function masteryLevelToState(masteryLevel: number): SkillState {
  if (masteryLevel >= 3) {
    return "mastered";
  }

  if (masteryLevel === 2) {
    return "developing";
  }

  return "weak";
}

function getStatePriority(state: SkillState): number {
  if (state === "weak") {
    return 0;
  }

  if (state === "developing") {
    return 1;
  }

  return 2;
}

function isCanonicalSkillId(value: string): boolean {
  return /^lengua\.skill_\d+$/.test(value);
}

function clampMasteryLevel(value: number | undefined): 1 | 2 | 3 | 4 {
  if (value && value >= 4) {
    return 4;
  }

  if (value && value >= 3) {
    return 3;
  }

  if (value && value >= 2) {
    return 2;
  }

  return 1;
}

function clampScore(value: number): number {
  if (value >= 100) {
    return 100;
  }

  if (value <= 0) {
    return 0;
  }

  return value;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
