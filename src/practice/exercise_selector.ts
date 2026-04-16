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

type Target = {
  skill: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  difficultyMode: DifficultyMode;
};

export type SelectionOptions = {
  seenSkills?: string[];
  hasSeenSkill?: (skillId: string) => boolean;
};

export type SelectionResult = {
  exercise: Exercise;
  ruleApplied: RuleApplied;
};

export function selectNextExerciseDetailed(
  exercises: Exercise[],
  userState: UserSkillState[],
  options: SelectionOptions = {},
): SelectionResult {
  if (exercises.length === 0) {
    throw new Error("selectNextExercise requires at least one exercise");
  }

  const explorationExercise = pickUnseenSkillExercise(exercises, options);
  if (explorationExercise) {
    logSelection("E", explorationExercise);
    return { exercise: explorationExercise, ruleApplied: "E" };
  }

  if (userState.length === 0) {
    const selected = pickDeterministic(exercises);
    logSelection("E", selected);
    return { exercise: selected, ruleApplied: "E" };
  }

  const currentState = userState[0];
  const referenceDifficulty = getReferenceDifficulty(exercises, currentState);
  const { ruleApplied, target } = resolveRuleTarget(exercises, currentState, referenceDifficulty);

  const selected =
    pickStrictCandidate(exercises, target) ??
    pickFallbackCandidate(exercises, target) ??
    pickDeterministic(exercises);

  logSelection(ruleApplied, selected);
  return { exercise: selected, ruleApplied };
}

export function selectNextExercise(
  exercises: Exercise[],
  userState: UserSkillState[],
  options: SelectionOptions = {},
): Exercise {
  return selectNextExerciseDetailed(exercises, userState, options).exercise;
}

function resolveRuleTarget(
  exercises: Exercise[],
  state: UserSkillState,
  referenceDifficulty: 1 | 2 | 3,
): { ruleApplied: RuleApplied; target: Target } {
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
    const alternativeSubskill = findAlternativeSubskill(exercises, state.skill, state.subskill);

    return {
      ruleApplied: "C",
      target: {
        skill: state.skill,
        subskill: alternativeSubskill ?? state.subskill,
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
  const options = Array.from(
    new Set(
      exercises
        .filter((exercise) => exercise.skill === skill)
        .map((exercise) => exercise.subskill),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return options.find((option) => option !== currentSubskill) ?? null;
}

function getReferenceDifficulty(exercises: Exercise[], state: UserSkillState): 1 | 2 | 3 {
  const candidates = exercises.filter(
    (exercise) => exercise.skill === state.skill && exercise.subskill === state.subskill,
  );

  if (candidates.length === 0) {
    return 1;
  }

  const sorted = candidates.map((exercise) => exercise.difficulty).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as 1 | 2 | 3;
}

function pickStrictCandidate(exercises: Exercise[], target: Target): Exercise | null {
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
    return [...candidates].sort((a, b) => b.difficulty - a.difficulty)[0];
  }

  return pickDeterministic(candidates);
}

function pickFallbackCandidate(exercises: Exercise[], target: Target): Exercise | null {
  const sameSkill = exercises.filter((exercise) => exercise.skill === target.skill);

  if (sameSkill.length === 0) {
    return null;
  }

  const step1 = sameSkill.filter((exercise) => {
    if (target.difficultyMode === "same_or_lower") {
      return exercise.difficulty <= target.difficulty;
    }

    return exercise.difficulty === target.difficulty;
  });

  if (step1.length > 0) {
    return pickDeterministic(step1);
  }

  return pickRandom(sameSkill);
}

function pickUnseenSkillExercise(exercises: Exercise[], options: SelectionOptions): Exercise | null {
  if (!options.hasSeenSkill && !options.seenSkills) {
    return null;
  }

  const seenSkills = new Set(options.seenSkills ?? []);
  const allSkills = Array.from(new Set(exercises.map((exercise) => exercise.skill)))
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({ id }));
  const hasSeenSkill = options.hasSeenSkill ?? ((skillId: string) => seenSkills.has(skillId));
  const unseenSkills = allSkills.filter((skill) => !hasSeenSkill(skill.id));
  const nextSkill = unseenSkills[0]?.id;

  if (!nextSkill) {
    return null;
  }

  return pickDeterministic(
    exercises
      .filter((exercise) => exercise.skill === nextSkill)
      .sort((left, right) => left.difficulty - right.difficulty || left.id.localeCompare(right.id)),
  );
}

function pickDeterministic(candidates: Exercise[]): Exercise {
  return [...candidates].sort((a, b) => a.id.localeCompare(b.id))[0];
}

function pickRandom(candidates: Exercise[]): Exercise {
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
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
    {
      id: "LEN-VOC-001-01",
      skill: "LEN-VOC-001",
      subskill: "inferir significado por pistas cercanas",
      difficulty: 1,
    },
    {
      id: "LEN-VOC-001-02",
      skill: "LEN-VOC-001",
      subskill: "inferir significado por pistas cercanas",
      difficulty: 2,
    },
    {
      id: "LEN-VOC-001-03",
      skill: "LEN-VOC-001",
      subskill: "inferir significado por pistas cercanas",
      difficulty: 3,
    },
    {
      id: "LEN-VOC-001-04",
      skill: "LEN-VOC-001",
      subskill: "reconocer acepcion adecuada",
      difficulty: 2,
    },
    {
      id: "LEN-VOC-001-05",
      skill: "LEN-VOC-001",
      subskill: "interpretar expresiones no literales",
      difficulty: 2,
    },
  ];

  const recurringErrors: UserSkillState[] = [
    {
      skill: "LEN-VOC-001",
      subskill: "inferir significado por pistas cercanas",
      accuracy: 0.55,
      streak: 0,
      lastResult: "incorrect",
    },
  ];

  const positiveStreak: UserSkillState[] = [
    {
      skill: "LEN-VOC-001",
      subskill: "inferir significado por pistas cercanas",
      accuracy: 0.8,
      streak: 3,
      lastResult: "correct",
    },
  ];

  const highAccuracy: UserSkillState[] = [
    {
      skill: "LEN-VOC-001",
      subskill: "inferir significado por pistas cercanas",
      accuracy: 0.9,
      streak: 1,
      lastResult: "correct",
    },
  ];

  const selectionA = selectNextExercise(mockExercises, recurringErrors);
  if (
    selectionA.skill !== "LEN-VOC-001" ||
    selectionA.subskill !== "inferir significado por pistas cercanas" ||
    selectionA.difficulty > 2
  ) {
    throw new Error("Rule A violation");
  }

  const selectionB = selectNextExercise(mockExercises, positiveStreak);
  if (
    selectionB.skill !== "LEN-VOC-001" ||
    selectionB.subskill !== "inferir significado por pistas cercanas" ||
    selectionB.difficulty !== 3
  ) {
    throw new Error("Rule B violation");
  }

  const originalSkill = highAccuracy[0].skill;
  const selectionC = selectNextExercise(mockExercises, highAccuracy);
  if (selectionC.skill !== originalSkill) {
    throw new Error("Rule C violation: skill changed");
  }

  if (selectionC.subskill === highAccuracy[0].subskill) {
    throw new Error("Rule C violation: subskill did not change");
  }

  console.log("testSelector passed");
}
