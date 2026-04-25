import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
} from "@/progress/mastery_model";
import { getSkillMetadata } from "@/skills/skill_metadata";
import { type StoredProgress } from "@/storage/local_progress_store";

export type ProgressSummary = {
  totalAttempts: number;
  totalCorrect: number;
  totalErrors: number;
  totalSessions: number;
  activeDays: number;
  accuracy: number;
  totalDurationSeconds: number;
  lastSessionAt: string | null;
  weeklyData: Array<{
    day: string;
    date: string;
    exercises: number;
    accuracy: number;
  }>;
  skills: Array<{
    id: string;
    title: string;
    attempts: number;
    correct: number;
    accuracy: number;
    masteryLevel: number;
    masteryScore: number;
    state: string;
  }>;
};

export function buildProgressSummary(progress: StoredProgress): ProgressSummary {
  const sessions = progress.sessions;
  const totalAttempts = sessions.reduce((sum, session) => sum + session.total_attempts, 0);
  const totalCorrect = sessions.reduce((sum, session) => sum + session.total_correct, 0);
  const totalErrors = sessions.reduce((sum, session) => sum + session.total_errors, 0);
  const totalDurationSeconds = sessions.reduce((sum, session) => sum + (session.duration_seconds ?? 0), 0);
  const sessionDates = Array.from(new Set(sessions.map((session) => session.created_at.slice(0, 10))));
  const model = buildMasteryModel(progress);

  return {
    totalAttempts,
    totalCorrect,
    totalErrors,
    totalSessions: sessions.length,
    activeDays: sessionDates.length,
    accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    totalDurationSeconds,
    lastSessionAt: sessions.at(-1)?.created_at ?? null,
    weeklyData: buildWeeklyData(progress),
    skills: CANONICAL_LENGUA_SKILLS.map((skillId) => {
      const summary = model.skills[skillId];
      const attempts = summary?.totalAttempts ?? 0;
      const correct = summary?.totalCorrect ?? 0;
      const metadata = getSkillMetadata(skillId);

      return {
        id: skillId,
        title: metadata.title,
        attempts,
        correct,
        accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
        masteryLevel: summary?.masteryLevel ?? 1,
        masteryScore: summary?.masteryScore ?? 0,
        state: summary?.state ?? "not_started",
      };
    }),
  };
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return "0 min";
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

function buildWeeklyData(progress: StoredProgress): ProgressSummary["weeklyData"] {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });

  return days.map((date) => {
    const sessions = progress.sessions.filter((session) => session.created_at.slice(0, 10) === date);
    const attempts = sessions.reduce((sum, session) => sum + session.total_attempts, 0);
    const correct = sessions.reduce((sum, session) => sum + session.total_correct, 0);

    return {
      day: getDayLabel(date),
      date,
      exercises: attempts,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
    };
  });
}

function getDayLabel(date: string): string {
  const day = new Date(`${date}T00:00:00`).getDay();
  return ["D", "L", "M", "X", "J", "V", "S"][day] ?? "";
}
