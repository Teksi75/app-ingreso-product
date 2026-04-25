import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Redis } from "@upstash/redis";
import {
  buildPracticeProgressSnapshot,
  buildMasteryModel,
  getWeakestSkillId,
} from "../progress/mastery_model.ts";

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
  area?: "lengua";
  total_attempts: number;
  total_correct: number;
  total_errors: number;
  score_percentage?: number;
  duration_seconds?: number;
  exercise_ids?: string[];
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

const defaultProgressCode = "default";
const redisProgressKeyPrefix = process.env.PROGRESS_REDIS_KEY ?? "progress";
let memoryProgressByCode = new Map<string, StoredProgress>();
let redisClient: Redis | null | undefined;

export function loadProgress(studentCode?: string): StoredProgress {
  const code = normalizeProgressCode(studentCode);
  const cachedProgress = memoryProgressByCode.get(code);

  if (cachedProgress) {
    return cloneProgress(cachedProgress);
  }

  const progressPath = getProgressPath(code);

  if (!existsSync(progressPath)) {
    return createEmptyProgress();
  }

  try {
    const raw = readFileSync(progressPath, "utf8");
    const progress = JSON.parse(raw) as StoredProgress;
    progress.sessions = Array.isArray(progress.sessions) ? progress.sessions : [];
    progress.skill_stats = progress.skill_stats ?? {};
    progress.seenSkills ??= [];

    return normalizeProgress(progress);
  } catch {
    return createEmptyProgress();
  }
}

export async function loadProgressAsync(studentCode?: string): Promise<StoredProgress> {
  const code = normalizeProgressCode(studentCode);
  const redis = getRedisClient();

  if (!redis) {
    return loadProgress(code);
  }

  try {
    const progress = await redis.get<StoredProgress>(getRedisProgressKey(code));
    return normalizeProgress(progress ?? createEmptyProgress());
  } catch {
    return cloneProgress(memoryProgressByCode.get(code) ?? createEmptyProgress());
  }
}

export function saveSessionResult(sessionData: SessionData, studentCode?: string): StoredProgress {
  const progress = loadProgress(studentCode);
  const updated = appendSessionResult(progress, sessionData);
  writeProgress(updated, studentCode);

  return updated;
}

export async function saveSessionResultAsync(
  sessionData: SessionData,
  studentCode?: string,
): Promise<StoredProgress> {
  const progress = await loadProgressAsync(studentCode);
  const updated = appendSessionResult(progress, sessionData);
  await writeProgressAsync(updated, studentCode);

  return updated;
}

function appendSessionResult(progress: StoredProgress, sessionData: SessionData): StoredProgress {
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

export function markSkillsSeen(skillIds: string[], studentCode?: string): StoredProgress {
  const progress = loadProgress(studentCode);
  updateSeenSkills(progress, skillIds);
  writeProgress(progress, studentCode);

  return progress;
}

export async function markSkillsSeenAsync(skillIds: string[], studentCode?: string): Promise<StoredProgress> {
  const progress = await loadProgressAsync(studentCode);
  updateSeenSkills(progress, skillIds);
  await writeProgressAsync(progress, studentCode);

  return progress;
}

export function getSeenSkills(studentCode?: string): string[] {
  return loadProgress(studentCode).seenSkills ?? [];
}

export async function getSeenSkillsAsync(studentCode?: string): Promise<string[]> {
  return (await loadProgressAsync(studentCode)).seenSkills ?? [];
}

export function getPracticeProgressSnapshot(progress: StoredProgress = loadProgress()): PracticeProgressSnapshot {
  return buildPracticeProgressSnapshot(progress);
}

export function getWeakestPracticeSkillId(
  skillIds: string[],
  progress: StoredProgress = loadProgress(),
): string | null {
  return getWeakestSkillId(buildMasteryModel(progress), skillIds);
}

export async function resetProgress(studentCode?: string): Promise<void> {
  const code = normalizeProgressCode(studentCode);
  memoryProgressByCode.delete(code);

  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.del(getRedisProgressKey(code));
      return;
    } catch {
      memoryProgressByCode.set(code, createEmptyProgress());
      return;
    }
  }

  const progressPath = getProgressPath(code);

  if (existsSync(progressPath)) {
    try {
      unlinkSync(progressPath);
    } catch {
      memoryProgressByCode.set(code, createEmptyProgress());
    }
  }
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

function normalizeProgress(progress: StoredProgress): StoredProgress {
  progress.sessions = Array.isArray(progress.sessions) ? progress.sessions : [];
  progress.skill_stats = progress.skill_stats ?? {};
  progress.seenSkills ??= [];

  return progress;
}

function cloneProgress(progress: StoredProgress): StoredProgress {
  return JSON.parse(JSON.stringify(progress)) as StoredProgress;
}

function writeProgress(progress: StoredProgress, studentCode?: string): void {
  const code = normalizeProgressCode(studentCode);
  const progressPath = getProgressPath(code);

  try {
    mkdirSync(dirname(progressPath), { recursive: true });
    const tempPath = `${progressPath}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
    renameSync(tempPath, progressPath);
  } catch {
    memoryProgressByCode.set(code, cloneProgress(progress));
  }
}

async function writeProgressAsync(progress: StoredProgress, studentCode?: string): Promise<void> {
  const code = normalizeProgressCode(studentCode);
  const redis = getRedisClient();

  if (!redis) {
    writeProgress(progress, code);
    return;
  }

  try {
    await redis.set(getRedisProgressKey(code), progress);
  } catch {
    memoryProgressByCode.set(code, cloneProgress(progress));
  }
}

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getProgressPath(studentCode: string): string {
  if (studentCode === defaultProgressCode) {
    return resolve(process.cwd(), "data/progress.json");
  }

  return resolve(process.cwd(), `data/progress_${studentCode}.json`);
}

function getRedisProgressKey(studentCode: string): string {
  return `${redisProgressKeyPrefix}:${studentCode}`;
}

function normalizeProgressCode(studentCode?: string): string {
  if (!studentCode) {
    return defaultProgressCode;
  }

  const normalized = studentCode.trim().toLowerCase();
  return /^[a-z0-9_-]{4,64}$/.test(normalized) ? normalized : defaultProgressCode;
}
