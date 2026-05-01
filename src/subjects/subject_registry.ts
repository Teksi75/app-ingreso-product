export type SubjectId = "lengua" | "matematica";

export type SubjectDefinition = {
  id: SubjectId;
  label: string;
  defaultPracticeHref: string;
};

export type SubjectExercise = {
  id: string;
  subject: SubjectId;
  skill: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  prerequisite_focus_ids?: string[];
};

export type SubjectSelectionOptions = {
  subject?: string | null;
  masteryByFocus?: Record<string, number>;
};

const SUBJECT_REGISTRY: Record<SubjectId, SubjectDefinition> = {
  lengua: {
    id: "lengua",
    label: "Lengua",
    defaultPracticeHref: "/practice?mode=training",
  },
  matematica: {
    id: "matematica",
    label: "Matemática",
    defaultPracticeHref: "/practice?mode=training&subject=matematica",
  },
};

export const DEFAULT_SUBJECT_ID: SubjectId = "lengua";

export function listSubjects(): SubjectDefinition[] {
  return Object.values(SUBJECT_REGISTRY);
}

export function getSubjectDefinition(subjectId: SubjectId): SubjectDefinition {
  return SUBJECT_REGISTRY[subjectId];
}

export function resolveSubjectId(value: string | null | undefined): SubjectId {
  if (value === "matematica") {
    return "matematica";
  }

  return DEFAULT_SUBJECT_ID;
}

export function createSubjectExercise(
  subject: SubjectId,
  exercise: Omit<SubjectExercise, "subject">,
): SubjectExercise {
  return { ...exercise, subject };
}

export function canAccessSubjectSkill(
  subject: SubjectId,
  input: {
    skillId: string;
    prerequisites?: string[];
    masteryByFocus?: Record<string, number>;
  },
): boolean {
  if (subject === "lengua") {
    return true;
  }

  const prerequisites = input.prerequisites ?? [];
  const masteryByFocus = input.masteryByFocus ?? {};
  return prerequisites.every((focusId) => (masteryByFocus[focusId] ?? 1) >= 2);
}

export function selectSubjectExercise(
  exercises: SubjectExercise[],
  options: SubjectSelectionOptions,
): SubjectExercise | null {
  const subject = resolveSubjectId(options.subject);
  const bySubject = exercises.filter((exercise) => exercise.subject === subject);
  const source = bySubject.length > 0 ? bySubject : exercises.filter((exercise) => exercise.subject === DEFAULT_SUBJECT_ID);
  const masteryByFocus = options.masteryByFocus ?? {};

  const unlocked = source.find((exercise) => canAccessSubjectSkill(exercise.subject, {
    skillId: exercise.skill,
    prerequisites: exercise.prerequisite_focus_ids,
    masteryByFocus,
  }));

  return unlocked ?? source[0] ?? null;
}

export function normalizeSharedExerciseContract<T extends {
  skill_id: string;
  subskill: string;
  difficulty: number;
  mastery_level: number;
}>(exercise: T): T & { subject: SubjectId } {
  return {
    ...exercise,
    subject: DEFAULT_SUBJECT_ID,
  };
}
