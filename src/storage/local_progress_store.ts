import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const progressPath = resolve(process.cwd(), "data/progress.json");

export function loadProgress(): StoredProgress {
  if (!existsSync(progressPath)) {
    return createEmptyProgress();
  }

  const raw = readFileSync(progressPath, "utf8");
  const progress = JSON.parse(raw) as StoredProgress;
  progress.seenSkills ??= [];

  return progress;
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

function updateSeenSkills(progress: StoredProgress, skillIds: string[]): StoredProgress {
  const seenSkills = new Set(progress.seenSkills ?? []);

  for (const skillId of skillIds) {
    seenSkills.add(skillId);
  }

  progress.seenSkills = [...seenSkills].sort((left, right) => left.localeCompare(right));

  return progress;
}

function createEmptyProgress(): StoredProgress {
  return {
    sessions: [],
    seenSkills: [],
    skill_stats: {},
  };
}

function writeProgress(progress: StoredProgress): void {
  mkdirSync(dirname(progressPath), { recursive: true });
  writeFileSync(progressPath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
