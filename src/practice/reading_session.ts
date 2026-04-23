import { type ReadingUnit } from "../types/reading_unit.ts";
import { startReadingUnitSession, type Exercise } from "./session_runner.ts";

export type ReadingSession = {
  sessionType: "reading-based";
  readingUnit: ReadingUnit;
  exercises: Exercise[];
  summary: {
    exerciseCount: number;
  };
};

export function startReadingSession(readingUnitId?: string): ReadingSession {
  const session = startReadingUnitSession(readingUnitId ?? null, [], { forceNewStudent: true });

  return {
    sessionType: "reading-based",
    readingUnit: session.readingUnit,
    exercises: session.sessionExercises,
    summary: {
      exerciseCount: session.sessionExercises.length,
    },
  };
}

export function runReadingSession(readingUnitId?: string): ReadingSession {
  return startReadingSession(readingUnitId);
}
