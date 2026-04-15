export type Result = "correct" | "incorrect";

export type Exercise = {
  id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
};

export type HistoryItem = {
  exercise_id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  result: Result;
};

export type RuleApplied = "A" | "B" | "C" | "D" | "E";

export type SelectionTrace = {
  ruleApplied: RuleApplied;
  skill: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
};

export type SelectionResult = {
  exercise: Exercise;
  trace: SelectionTrace;
};

function pickFirst(exercises: Exercise[]): Exercise {
  if (exercises.length === 0) {
    throw new Error("No hay ejercicios disponibles para seleccionar.");
  }

  return exercises[0];
}

function availableDifficulties(exercises: Exercise[], skillId: string): Array<1 | 2 | 3> {
  return [...new Set(exercises.filter((e) => e.skill_id === skillId).map((e) => e.difficulty))].sort(
    (a, b) => a - b,
  ) as Array<1 | 2 | 3>;
}

function hasRecentRecurrentError(history: HistoryItem[], skillId: string): boolean {
  const recent = history.filter((h) => h.skill_id === skillId).slice(-3);
  const errors = recent.filter((h) => h.result === "incorrect").length;
  return errors >= 2;
}

function hasConsistentCorrect(history: HistoryItem[], skillId: string): boolean {
  const recent = history.filter((h) => h.skill_id === skillId).slice(-3);
  if (recent.length < 2) {
    return false;
  }

  const lastTwoCorrect = recent.slice(-2).every((h) => h.result === "correct");
  const hasRecentError = recent.some((h) => h.result === "incorrect");

  return lastTwoCorrect && !hasRecentError;
}

function isHighPrecisionSkill(history: HistoryItem[], skillId: string): boolean {
  const recent = history.filter((h) => h.skill_id === skillId).slice(-4);

  if (recent.length < 3) {
    return false;
  }

  const correct = recent.filter((h) => h.result === "correct").length;
  return correct / recent.length >= 0.8;
}

function pickCandidate(
  exercises: Exercise[],
  skillId: string,
  targetDifficulties: Array<1 | 2 | 3>,
  lastExerciseId?: string,
  preferredSubskill?: string,
): Exercise | null {
  for (const difficulty of targetDifficulties) {
    const bySkillAndDifficulty = exercises.filter(
      (e) => e.skill_id === skillId && e.difficulty === difficulty && e.id !== lastExerciseId,
    );

    if (bySkillAndDifficulty.length === 0) {
      continue;
    }

    if (!preferredSubskill) {
      return pickFirst(bySkillAndDifficulty);
    }

    const differentSubskill = bySkillAndDifficulty.find((e) => e.subskill !== preferredSubskill);
    return differentSubskill ?? pickFirst(bySkillAndDifficulty);
  }

  return null;
}

function pickAnyValid(exercises: Exercise[], lastExerciseId?: string): Exercise {
  const filtered = exercises.filter((e) => e.id !== lastExerciseId);
  return pickFirst(filtered.length > 0 ? filtered : exercises);
}

function trace(ruleApplied: RuleApplied, exercise: Exercise): SelectionResult {
  return {
    exercise,
    trace: {
      ruleApplied,
      skill: exercise.skill_id,
      subskill: exercise.subskill,
      difficulty: exercise.difficulty,
    },
  };
}

export function selectNextExercise(history: HistoryItem[], exercises: Exercise[]): SelectionResult {
  if (exercises.length === 0) {
    throw new Error("No hay ejercicios para ejecutar selectNextExercise.");
  }

  const last = history.at(-1);

  if (!last) {
    return trace("E", pickAnyValid(exercises));
  }

  const lastExerciseId = last.exercise_id;

  // Regla A: error recurrente -> mantener skill con menor dificultad disponible.
  const recurrentSkill = [...new Set(history.map((h) => h.skill_id))].find((skillId) =>
    hasRecentRecurrentError(history, skillId),
  );

  if (recurrentSkill) {
    const recentInSkill = history.filter((h) => h.skill_id === recurrentSkill).at(-1);
    const maxDifficulty = recentInSkill?.difficulty ?? 2;
    const targetDiffs: Array<1 | 2 | 3> = [
      (maxDifficulty > 1 ? maxDifficulty - 1 : 1) as 1 | 2 | 3,
      maxDifficulty as 1 | 2 | 3,
      1,
      2,
      3,
    ];

    const candidate =
      pickCandidate(exercises, recurrentSkill, targetDiffs, lastExerciseId, recentInSkill?.subskill) ??
      pickAnyValid(
        exercises.filter((e) => e.skill_id === recurrentSkill && e.id !== lastExerciseId).length > 0
          ? exercises.filter((e) => e.skill_id === recurrentSkill)
          : exercises,
        lastExerciseId,
      );

    return trace("A", candidate);
  }

  // Regla B: ultimo resultado incorrecto (no recurrente) -> misma skill, misma o menor dificultad.
  if (last.result === "incorrect") {
    const lowerOrSameDiffs: Array<1 | 2 | 3> = [
      (last.difficulty > 1 ? last.difficulty - 1 : 1) as 1 | 2 | 3,
      last.difficulty,
      1,
      2,
      3,
    ];

    const candidate =
      pickCandidate(exercises, last.skill_id, lowerOrSameDiffs, lastExerciseId, last.subskill) ??
      pickAnyValid(
        exercises.filter((e) => e.skill_id === last.skill_id && e.id !== lastExerciseId).length > 0
          ? exercises.filter((e) => e.skill_id === last.skill_id)
          : exercises,
        lastExerciseId,
      );

    return trace("B", candidate);
  }

  // Regla C: alta precision -> mantener skill, subir dificultad o variar subskill si no se puede subir.
  if (isHighPrecisionSkill(history, last.skill_id)) {
    const skillDiffs = availableDifficulties(exercises, last.skill_id);
    const higher = skillDiffs.filter((d) => d > last.difficulty);
    const targetDiffs = (higher.length > 0 ? [...higher, last.difficulty, 1, 2, 3] : [last.difficulty, 1, 2, 3]) as
      Array<1 | 2 | 3>;

    const candidate =
      pickCandidate(exercises, last.skill_id, targetDiffs, lastExerciseId, last.subskill) ??
      pickAnyValid(
        exercises.filter((e) => e.skill_id === last.skill_id && e.id !== lastExerciseId).length > 0
          ? exercises.filter((e) => e.skill_id === last.skill_id)
          : exercises,
        lastExerciseId,
      );

    return trace("C", candidate);
  }

  // Regla D: racha positiva -> mantener skill y variar subskill en misma dificultad cuando se pueda.
  if (hasConsistentCorrect(history, last.skill_id)) {
    const candidate =
      pickCandidate(exercises, last.skill_id, [last.difficulty, 1, 2, 3], lastExerciseId, last.subskill) ??
      pickAnyValid(
        exercises.filter((e) => e.skill_id === last.skill_id && e.id !== lastExerciseId).length > 0
          ? exercises.filter((e) => e.skill_id === last.skill_id)
          : exercises,
        lastExerciseId,
      );

    return trace("D", candidate);
  }

  // Regla E: fallback global robusto.
  return trace("E", pickAnyValid(exercises, lastExerciseId));
}

function sampleExercises(): Exercise[] {
  return [
    { id: "e1", skill_id: "LEN-READ-001", subskill: "idea principal", difficulty: 1 },
    { id: "e2", skill_id: "LEN-READ-001", subskill: "detalle explicito", difficulty: 1 },
    { id: "e3", skill_id: "LEN-READ-001", subskill: "inferencias", difficulty: 2 },
    { id: "e4", skill_id: "LEN-READ-001", subskill: "tono", difficulty: 3 },
    { id: "e5", skill_id: "LEN-GRAM-001", subskill: "concordancia", difficulty: 1 },
    { id: "e6", skill_id: "LEN-GRAM-001", subskill: "acentuacion", difficulty: 2 },
    { id: "e7", skill_id: "LEN-VOC-001", subskill: "sinonimos", difficulty: 1 },
  ];
}

export function testSelector(): SelectionTrace[] {
  const exercises = sampleExercises();

  const scenarios: Array<{ name: string; history: HistoryItem[] }> = [
    {
      name: "error recurrente",
      history: [
        {
          exercise_id: "e3",
          skill_id: "LEN-READ-001",
          subskill: "inferencias",
          difficulty: 2,
          result: "incorrect",
        },
        {
          exercise_id: "e4",
          skill_id: "LEN-READ-001",
          subskill: "tono",
          difficulty: 3,
          result: "incorrect",
        },
        {
          exercise_id: "e6",
          skill_id: "LEN-GRAM-001",
          subskill: "acentuacion",
          difficulty: 2,
          result: "correct",
        },
        {
          exercise_id: "e3",
          skill_id: "LEN-READ-001",
          subskill: "inferencias",
          difficulty: 2,
          result: "incorrect",
        },
      ],
    },
    {
      name: "racha positiva",
      history: [
        {
          exercise_id: "e1",
          skill_id: "LEN-READ-001",
          subskill: "idea principal",
          difficulty: 1,
          result: "correct",
        },
        {
          exercise_id: "e2",
          skill_id: "LEN-READ-001",
          subskill: "detalle explicito",
          difficulty: 1,
          result: "correct",
        },
      ],
    },
    {
      name: "alta precision",
      history: [
        {
          exercise_id: "e1",
          skill_id: "LEN-READ-001",
          subskill: "idea principal",
          difficulty: 1,
          result: "correct",
        },
        {
          exercise_id: "e2",
          skill_id: "LEN-READ-001",
          subskill: "detalle explicito",
          difficulty: 1,
          result: "correct",
        },
        {
          exercise_id: "e3",
          skill_id: "LEN-READ-001",
          subskill: "inferencias",
          difficulty: 2,
          result: "correct",
        },
        {
          exercise_id: "e4",
          skill_id: "LEN-READ-001",
          subskill: "tono",
          difficulty: 3,
          result: "correct",
        },
      ],
    },
  ];

  const traces = scenarios.map((scenario) => {
    const selected = selectNextExercise(scenario.history, exercises);
    const { trace } = selected;

    console.log(`[scenario:${scenario.name}]`);
    console.log(
      `ruleApplied=${trace.ruleApplied} | skill=${trace.skill} | subskill=${trace.subskill} | difficulty=${trace.difficulty}`,
    );

    return trace;
  });

  return traces;
}
