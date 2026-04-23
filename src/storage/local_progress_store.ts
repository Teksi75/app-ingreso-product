import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type SkillState = "weak" | "developing" | "mastered";
export type SessionMode = "practice" | "reading" | "simulator";

export type SessionSkillResult = {
  skill_id: string;
  attempts: number;
  correct: number;
  state: SkillState;
  mastery_level?: number;
};

export type SessionData = {
  mode: SessionMode;
  total_attempts: number;
  total_correct: number;
  total_errors: number;
  skill_results: SessionSkillResult[];
  readingUnitId?: string;
};

export type StoredProgress = {
  sessions: Array<SessionData & { id: string; created_at: string }>;
  seenSkills?: string[];
  skill_stats: Record<
    string,
    {
      total_attempts: number;
      total_correct: number;
      last_state: SkillState;
      mastery_level?: number;
    }
  >;
};

export type PracticeSkillProgress = {
  skill_id: string;
  total_attempts: number;
  total_correct: number;
  practice_sessions: number;
  last_state: SkillState;
  mastery_level: number;
};

export type PracticeProgressSnapshot = {
  seenSkills: string[];
  masteryByFocus: Record<string, number>;
  practiceSkillStats: Record<string, PracticeSkillProgress>;
};

const progressPath = resolve(process.cwd(), "data/progress.json");

export function loadProgress(): StoredProgress {
  if (!existsSync(progressPath)) {
    return createEmptyProgress();
  }

  try {
    const raw = readFileSync(progressPath, "utf8");
    const progress = JSON.parse(raw) as StoredProgress;
    progress.sessions = Array.isArray(progress.sessions) ? progress.sessions : [];
    progress.skill_stats = progress.skill_stats ?? {};
    progress.seenSkills ??= [];

    return progress;
  } catch {
    return createEmptyProgress();
  }
}

export function saveSessionResult(sessionData: SessionData): StoredProgress {
  const progress = loadProgress();
  const session = {
    ...sessionData,
    id: createSessionId(),
    created_at: new Date().toISOString(),
  };

  progress.sessions.push(session);
  updateSkillStats(progress, sessionData);
  updateSeenSkills(
    progress,
    sessionData.skill_results.map((skillResult) => skillResult.skill_id),
  );
  writeProgress(progress);

  return progress;
}

export function updateSkillStats(progress: StoredProgress, sessionData: SessionData): StoredProgress {
  for (const skillResult of sessionData.skill_results) {
    progress.skill_stats[skillResult.skill_id] ??= {
      total_attempts: 0,
      total_correct: 0,
      last_state: skillResult.state,
      mastery_level: skillResult.mastery_level,
    };

    const stats = progress.skill_stats[skillResult.skill_id];
    stats.total_attempts += skillResult.attempts;
    stats.total_correct += skillResult.correct;
    stats.last_state = skillResult.state;
    stats.mastery_level = skillResult.mastery_level ?? stats.mastery_level;
  }

  return progress;
}

export function markSkillsSeen(skillIds: string[]): StoredProgress {
  const progress = loadProgress();
  updateSeenSkills(progress, skillIds);
  writeProgress(progress);

  return progress;
}

export function getSeenSkills(): string[] {
  return loadProgress().seenSkills ?? [];
}

export function getPracticeProgressSnapshot(progress: StoredProgress = loadProgress()): PracticeProgressSnapshot {
  return {
    seenSkills: [...(progress.seenSkills ?? [])],
    masteryByFocus: Object.fromEntries(
      Object.entries(progress.skill_stats).map(([skillId, stats]) => [
        skillId,
        clampMasteryLevel(stats.mastery_level),
      ]),
    ),
    practiceSkillStats: buildPracticeSkillStats(progress),
  };
}

export function getWeakestPracticeSkillId(
  skillIds: string[],
  progress: StoredProgress = loadProgress(),
): string | null {
  const snapshot = getPracticeProgressSnapshot(progress);

  return [...skillIds].sort((left, right) => {
    const leftStats = snapshot.practiceSkillStats[left];
    const rightStats = snapshot.practiceSkillStats[right];
    const stateDifference = getStatePriority(leftStats?.last_state) - getStatePriority(rightStats?.last_state);

    if (stateDifference !== 0) {
      return stateDifference;
    }

    const leftAccuracy = leftStats && leftStats.total_attempts > 0
      ? leftStats.total_correct / leftStats.total_attempts
      : 0;
    const rightAccuracy = rightStats && rightStats.total_attempts > 0
      ? rightStats.total_correct / rightStats.total_attempts
      : 0;

    return leftAccuracy - rightAccuracy || left.localeCompare(right);
  })[0] ?? null;
}

function updateSeenSkills(progress: StoredProgress, skillIds: string[]): StoredProgress {
  const seenSkills = new Set(progress.seenSkills ?? []);

  for (const skillId of skillIds) {
    seenSkills.add(skillId);
  }

  progress.seenSkills = [...seenSkills].sort((left, right) => left.localeCompare(right));

  return progress;
}

function buildPracticeSkillStats(progress: StoredProgress): Record<string, PracticeSkillProgress> {
  const statsBySkill: Record<string, PracticeSkillProgress> = {};

  for (const session of progress.sessions ?? []) {
    if (session.mode !== "practice") {
      continue;
    }

    for (const skillResult of session.skill_results) {
      statsBySkill[skillResult.skill_id] ??= {
        skill_id: skillResult.skill_id,
        total_attempts: 0,
        total_correct: 0,
        practice_sessions: 0,
        last_state: skillResult.state,
        mastery_level: clampMasteryLevel(progress.skill_stats[skillResult.skill_id]?.mastery_level),
      };

      const stats = statsBySkill[skillResult.skill_id];
      stats.total_attempts += skillResult.attempts;
      stats.total_correct += skillResult.correct;
      stats.practice_sessions += 1;
      stats.last_state = skillResult.state;
      stats.mastery_level = clampMasteryLevel(
        skillResult.mastery_level ?? progress.skill_stats[skillResult.skill_id]?.mastery_level,
      );
    }
  }

  return statsBySkill;
}

function clampMasteryLevel(value: number | undefined): number {
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

function getStatePriority(state: SkillState | undefined): number {
  if (state === "mastered") {
    return 3;
  }

  if (state === "developing") {
    return 2;
  }

  if (state === "weak") {
    return 1;
  }

  return 0;
}

function createEmptyProgress(): StoredProgress {
  return {
    sessions: [],
    seenSkills: [],
    skill_stats: {},
  };
}

function writeProgress(progress: StoredProgress): void {
  try {
    mkdirSync(dirname(progressPath), { recursive: true });
    const tempPath = `${progressPath}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
    renameSync(tempPath, progressPath);
  } catch {
    // Silently fail in environments where filesystem is read-only (e.g. Vercel serverless)
  }
}

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
