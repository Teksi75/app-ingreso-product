import { getSkillMetadata } from "../skills/skill_metadata";
import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
  explainWeakestSkill,
} from "../progress/mastery_model.ts";
import { loadProgress, type SessionMode, type StoredProgress } from "../storage/local_progress_store.ts";
import { loadLenguaExercises } from "../practice/session_runner.ts";

export type NextStepRecommendationKind =
  | "continue-reading-unit"
  | "start-reading-unit"
  | "targeted-practice"
  | "simulator-ready"
  | "review-weak-skill";

export type NextStepRecommendation = {
  kind: NextStepRecommendationKind;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  reason: string;
  skillId?: string;
  readingUnitId?: string;
  basedOn: {
    lastSessionMode?: SessionMode;
    weakestSkillId?: string | null;
    recentSessionModes: SessionMode[];
  };
};

type ReadingUnitCandidate = {
  id: string;
  title: string;
  skillIds: string[];
};

export function getNextStepRecommendation(
  progress: StoredProgress = loadProgress(),
): NextStepRecommendation {
  const model = buildMasteryModel(progress);
  const sessions = [...(progress.sessions ?? [])].sort((left, right) => (
    left.created_at.localeCompare(right.created_at)
  ));
  const recentSessions = sessions.slice(-3);
  const latestSession = sessions.at(-1);
  const recentSessionModes = model.recentSessionModes.length > 0
    ? model.recentSessionModes
    : recentSessions.map((session) => session.mode);
  const weakestSkill = explainWeakestSkill(model, CANONICAL_LENGUA_SKILLS);
  const weakestSkillId = weakestSkill.skillId;
  const weakestSkillMetadata = weakestSkillId ? getSkillMetadata(weakestSkillId) : null;
  const readingUnits = getReadingUnitCandidates();
  const seenReadingUnitIds = new Set(
    sessions
      .map((session) => session.readingUnitId)
      .filter((readingUnitId): readingUnitId is string => Boolean(readingUnitId)),
  );
  const unreadReadingUnits = readingUnits.filter((readingUnit) => !seenReadingUnitIds.has(readingUnit.id));
  const latestReadingAccuracy = latestSession && latestSession.total_attempts > 0
    ? latestSession.total_correct / latestSession.total_attempts
    : null;

  if (latestSession?.mode === "reading" && latestSession.readingUnitId && latestReadingAccuracy !== null && latestReadingAccuracy < 0.8) {
    const readingUnit = readingUnits.find((candidate) => candidate.id === latestSession.readingUnitId);

    if (readingUnit) {
      return {
        kind: "continue-reading-unit",
        title: `Continuar lectura: ${readingUnit.title}`,
        description: "La ultima sesion de lectura todavia tiene margen de consolidacion. Conviene volver al mismo texto y reforzar la comprension.",
        ctaLabel: "Continuar lectura guiada",
        href: buildReadingHref(readingUnit.id),
        reason: "La ultima sesion fue de lectura y el modelo de mastery la considera todavia inestable.",
        readingUnitId: readingUnit.id,
        basedOn: {
          lastSessionMode: latestSession.mode,
          weakestSkillId,
          recentSessionModes,
        },
      };
    }
  }

  if (latestSession?.mode === "simulator" && weakestSkillId && weakestSkillMetadata) {
    return {
      kind: "review-weak-skill",
        title: `Revisar skill debil: ${weakestSkillMetadata.title}`,
        description: "El ultimo simulador dejo una habilidad debil. Conviene revisarla antes de volver a una evaluacion global.",
        ctaLabel: "Reforzar skill debil",
        href: buildPracticeHref(weakestSkillId),
        reason: weakestSkill.reason,
        skillId: weakestSkillId,
        basedOn: {
          lastSessionMode: latestSession.mode,
        weakestSkillId,
        recentSessionModes,
      },
    };
  }

  if (model.simulatorReadiness.ready && latestSession?.mode !== "simulator") {
    return {
      kind: "simulator-ready",
      title: "Listo para simulacion",
      description: "Ya hay suficiente practica acumulada y no aparecen skills debiles dominantes. Puedes pasar a una sesion global.",
      ctaLabel: "Ir a simulaciones",
      href: "/simulaciones",
      reason: model.simulatorReadiness.reason,
      basedOn: {
        lastSessionMode: latestSession?.mode,
        weakestSkillId,
        recentSessionModes,
      },
    };
  }

  if (unreadReadingUnits.length > 0 && (!recentSessionModes.includes("reading") || latestSession?.mode === "practice")) {
    const readingUnit = pickReadingUnit(unreadReadingUnits, weakestSkillId) ?? unreadReadingUnits[0];

    if (readingUnit) {
      return {
        kind: "start-reading-unit",
        title: `Empezar lectura: ${readingUnit.title}`,
        description: "El siguiente mejor paso es abrir un texto base con actividades asociadas para practicar comprension en contexto.",
        ctaLabel: "Iniciar lectura con actividades",
        href: buildReadingHref(readingUnit.id),
        reason: recentSessionModes.includes("reading")
          ? "Hace varias sesiones que no trabajas comprension lectora con texto base."
          : "Todavia hay reading units sin trabajar y el modelo prioriza ampliar cobertura de lectura.",
        readingUnitId: readingUnit.id,
        basedOn: {
          lastSessionMode: latestSession?.mode,
          weakestSkillId,
          recentSessionModes,
        },
      };
    }
  }

  if (weakestSkillId && weakestSkillMetadata) {
    return {
      kind: "targeted-practice",
      title: `Practica focalizada: ${weakestSkillMetadata.title}`,
      description: weakestSkillMetadata.description,
      ctaLabel: "Entrenar skill sugerida",
      href: buildPracticeHref(weakestSkillId),
      reason: weakestSkill.reason,
      skillId: weakestSkillId,
      basedOn: {
        lastSessionMode: latestSession?.mode,
        weakestSkillId,
        recentSessionModes,
      },
    };
  }

  const defaultReadingUnit = pickReadingUnit(readingUnits, null) ?? readingUnits[0];

  return {
    kind: "start-reading-unit",
    title: defaultReadingUnit ? `Empezar lectura: ${defaultReadingUnit.title}` : "Iniciar practica de Lengua",
    description: "Todavia no hay suficiente historial para especializar la recomendacion. Conviene comenzar con una sesion guiada.",
    ctaLabel: defaultReadingUnit ? "Comenzar lectura guiada" : "Comenzar practica",
    href: defaultReadingUnit ? buildReadingHref(defaultReadingUnit.id) : "/practice?mode=training",
    reason: "El historial disponible aun es demasiado corto para una recomendacion mas especifica.",
    readingUnitId: defaultReadingUnit?.id,
    basedOn: {
      lastSessionMode: latestSession?.mode,
      weakestSkillId,
      recentSessionModes,
    },
  };
}

function getReadingUnitCandidates(): ReadingUnitCandidate[] {
  const byUnit = new Map<string, ReadingUnitCandidate>();

  for (const exercise of loadLenguaExercises()) {
    const readingUnit = exercise.reading_unit;

    if (!readingUnit) {
      continue;
    }

    byUnit.set(readingUnit.id, {
      id: readingUnit.id,
      title: readingUnit.title,
      skillIds: Array.from(new Set([
        ...(byUnit.get(readingUnit.id)?.skillIds ?? []),
        exercise.skill_id,
      ])).sort((left, right) => left.localeCompare(right)),
    });
  }

  return [...byUnit.values()].sort((left, right) => left.title.localeCompare(right.title));
}

function pickReadingUnit(
  readingUnits: ReadingUnitCandidate[],
  preferredSkillId: string | null,
): ReadingUnitCandidate | null {
  return [...readingUnits].sort((left, right) => {
    const leftMatches = preferredSkillId && left.skillIds.includes(preferredSkillId) ? 0 : 1;
    const rightMatches = preferredSkillId && right.skillIds.includes(preferredSkillId) ? 0 : 1;

    return leftMatches - rightMatches || left.title.localeCompare(right.title);
  })[0] ?? null;
}

function buildPracticeHref(skillId: string): string {
  const params = new URLSearchParams({
    mode: "training",
    skill: skillId,
  });

  return `/practice?${params.toString()}`;
}

function buildReadingHref(readingUnitId: string): string {
  const params = new URLSearchParams({
    mode: "reading",
    unit: readingUnitId,
  });

  return `/practice?${params.toString()}`;
}
