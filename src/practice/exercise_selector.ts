export type UserSkillState = {
  skill: string;
  subskill: string;
  accuracy: number;
  streak: number;
  lastResult: "correct" | "incorrect";
};

export type Exercise = {
  id: string;
  skill: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
};

type RuleApplied = "A" | "B" | "C" | "D" | "E";
type DifficultyMode = "exact" | "same_or_lower";

type TargetConfig = {
  skill: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  difficultyMode: DifficultyMode;
};

export function selectNextExercise(
  exercises: Exercise[],
  userState: UserSkillState[],
): Exercise {
  if (exercises.length === 0) {
    throw new Error("selectNextExercise requires at least one exercise");
  }

  if (userState.length === 0) {
    const fallback = pickDeterministic(exercises);
    logSelection("E", fallback);
    return fallback;
  }

  const focusState = selectFocusState(userState);
  const referenceDifficulty = getReferenceDifficulty(exercises, focusState);
  const { ruleApplied, target } = buildTargetConfig(exercises, focusState, referenceDifficulty);

  const selected =
    pickWithStrictTarget(exercises, target) ??
    pickWithFallback(exercises, target, ruleApplied) ??
    pickDeterministic(exercises);

  logSelection(ruleApplied, selected);
  return selected;
}

function selectFocusState(userState: UserSkillState[]): UserSkillState {
  const incorrectState = userState.find((state) => state.lastResult === "incorrect");

  if (incorrectState) {
    return incorrectState;
  }

  const streakState = userState.find((state) => state.streak >= 3);

  if (streakState) {
    return streakState;
  }

  const highAccuracyState = userState.find((state) => state.accuracy > 0.85);

  if (highAccuracyState) {
    return highAccuracyState;
  }

  const lowAccuracyState = userState.find((state) => state.accuracy < 0.6);

  if (lowAccuracyState) {
    return lowAccuracyState;
  }

  return userState[0];
}

function getReferenceDifficulty(exercises: Exercise[], state: UserSkillState): 1 | 2 | 3 {
  const sameSubskill = exercises.filter(
    (exercise) => exercise.skill === state.skill && exercise.subskill === state.subskill,
  );

  if (sameSubskill.length === 0) {
    return 1;
  }

  const sorted = sameSubskill
    .map((exercise) => exercise.difficulty)
    .sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)] as 1 | 2 | 3;
}

function buildTargetConfig(
  exercises: Exercise[],
  state: UserSkillState,
  referenceDifficulty: 1 | 2 | 3,
): { ruleApplied: RuleApplied; target: TargetConfig } {
  if (state.lastResult === "incorrect") {
    return {
      ruleApplied: "A",
      target: {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: referenceDifficulty,
        difficultyMode: "same_or_lower",
      },
    };
  }

  if (state.streak >= 3) {
    return {
      ruleApplied: "B",
      target: {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: Math.min(referenceDifficulty + 1, 3) as 1 | 2 | 3,
        difficultyMode: "exact",
      },
    };
  }

  if (state.accuracy > 0.85) {
    const targetSubskill =
      findAlternativeSubskill(exercises, state.skill, state.subskill) ?? state.subskill;

    return {
      ruleApplied: "C",
      target: {
        skill: state.skill,
        subskill: targetSubskill,
        difficulty: referenceDifficulty,
        difficultyMode: "exact",
      },
    };
  }

  if (state.accuracy < 0.6) {
    return {
      ruleApplied: "D",
      target: {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: Math.max(referenceDifficulty - 1, 1) as 1 | 2 | 3,
        difficultyMode: "exact",
      },
    };
  }

  return {
    ruleApplied: "E",
    target: {
      skill: state.skill,
      subskill: state.subskill,
      difficulty: referenceDifficulty,
      difficultyMode: "exact",
    },
  };
}

function findAlternativeSubskill(
  exercises: Exercise[],
  skill: string,
  currentSubskill: string,
): string | null {
  const subskills = Array.from(
    new Set(
      exercises
        .filter((exercise) => exercise.skill === skill)
        .map((exercise) => exercise.subskill),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return subskills.find((subskill) => subskill !== currentSubskill) ?? null;
}

function pickWithStrictTarget(exercises: Exercise[], target: TargetConfig): Exercise | null {
  const candidates = exercises.filter((exercise) => {
    if (exercise.skill !== target.skill || exercise.subskill !== target.subskill) {
      return false;
    }

    if (target.difficultyMode === "same_or_lower") {
      return exercise.difficulty <= target.difficulty;
    }

    return exercise.difficulty === target.difficulty;
  });

  if (candidates.length === 0) {
    return null;
  }

  if (target.difficultyMode === "same_or_lower") {
    const sorted = [...candidates].sort((a, b) => b.difficulty - a.difficulty);
    return sorted[0];
  }

  return pickDeterministic(candidates);
}

function pickWithFallback(
  exercises: Exercise[],
  target: TargetConfig,
  ruleApplied: RuleApplied,
): Exercise | null {
  const sameSkill = exercises.filter((exercise) => exercise.skill === target.skill);

  if (sameSkill.length === 0) {
    return null;
  }

  const fallbackStep1 = sameSkill.filter((exercise) => {
    if (target.difficultyMode === "same_or_lower") {
      return exercise.difficulty <= target.difficulty;
    }

    return exercise.difficulty === target.difficulty;
  });

  if (fallbackStep1.length > 0) {
    return pickDeterministic(fallbackStep1);
  }

  const fallbackStep2 = sameSkill;

  if (fallbackStep2.length > 0) {
    return pickDeterministic(fallbackStep2);
  }

  if (ruleApplied === "C") {
    return pickRandom(sameSkill);
  }

  return pickRandom(sameSkill);
}

function pickDeterministic(exercises: Exercise[]): Exercise {
  return [...exercises].sort((a, b) => a.id.localeCompare(b.id))[0];
}

function pickRandom(exercises: Exercise[]): Exercise {
  const index = Math.floor(Math.random() * exercises.length);
  return exercises[index];
}

function logSelection(ruleApplied: RuleApplied, exercise: Exercise): void {
  console.log({
    ruleApplied,
    selectedExerciseId: exercise.id,
    skill: exercise.skill,
    subskill: exercise.subskill,
    difficulty: exercise.difficulty,
  });
}

export function testSelector(): void {
  const mockExercises: Exercise[] = [
    { id: "e1", skill: "gramatica", subskill: "sujeto", difficulty: 1 },
    { id: "e2", skill: "gramatica", subskill: "sujeto", difficulty: 2 },
    { id: "e3", skill: "gramatica", subskill: "sujeto", difficulty: 3 },
    { id: "e4", skill: "gramatica", subskill: "predicado", difficulty: 2 },
    { id: "e5", skill: "gramatica", subskill: "predicado", difficulty: 3 },
  ];

  const recurringErrors: UserSkillState[] = [
    {
      skill: "gramatica",
      subskill: "sujeto",
      accuracy: 0.5,
      streak: 0,
      lastResult: "incorrect",
    },
  ];

  const positiveStreak: UserSkillState[] = [
    {
      skill: "gramatica",
      subskill: "sujeto",
      accuracy: 0.75,
      streak: 3,
      lastResult: "correct",
    },
  ];

  const highAccuracy: UserSkillState[] = [
    {
      skill: "gramatica",
      subskill: "sujeto",
      accuracy: 0.9,
      streak: 1,
      lastResult: "correct",
    },
  ];

  const selectionA = selectNextExercise(mockExercises, recurringErrors);
  if (
    selectionA.subskill !== "sujeto" ||
    !(selectionA.difficulty === 1 || selectionA.difficulty === 2)
  ) {
    throw new Error("testSelector failed for recurringErrors");
  }

  const selectionB = selectNextExercise(mockExercises, positiveStreak);
  if (selectionB.subskill !== "sujeto" || selectionB.difficulty !== 3) {
    throw new Error("testSelector failed for positiveStreak");
  }

  const selectionC = selectNextExercise(mockExercises, highAccuracy);
  if (selectionC.subskill !== "predicado") {
    throw new Error("testSelector failed for highAccuracy");
  }

  console.log("testSelector passed");
}
