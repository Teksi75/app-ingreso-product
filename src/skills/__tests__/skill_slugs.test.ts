import { describe, expect, it } from "vitest";
import {
  canonicalIdToSlug,
  slugToCanonicalId,
  readingUnitIdToSlug,
  slugToReadingUnitId,
} from "../skill_slugs";

describe("canonicalIdToSlug", () => {
  it("returns stable slug for each canonical skill", () => {
    expect(canonicalIdToSlug("lengua.skill_1")).toBe("comprension-global-del-texto");
    expect(canonicalIdToSlug("lengua.skill_2")).toBe("organizacion-de-ideas");
    expect(canonicalIdToSlug("lengua.skill_3")).toBe("escritura-clara-y-breve");
    expect(canonicalIdToSlug("lengua.skill_4")).toBe("gramatica-en-contexto");
    expect(canonicalIdToSlug("lengua.skill_5")).toBe("uso-de-verbos");
    expect(canonicalIdToSlug("lengua.skill_6")).toBe("ortografia-y-tildes");
    expect(canonicalIdToSlug("lengua.skill_7")).toBe("puntuacion-y-sentido");
  });

  it("returns slugified title for subskill IDs", () => {
    const slug = canonicalIdToSlug("lengua.skill_1.subskill_1");
    expect(slug).toMatch(/^informacion-/);
    expect(slug).not.toBe("lengua.skill_1.subskill_1");
  });

  it("returns the input unchanged for unknown IDs", () => {
    expect(canonicalIdToSlug("unknown-skill")).toBe("unknown-skill");
  });
});

describe("slugToCanonicalId", () => {
  it("round-trips canonical skill slugs back to IDs", () => {
    const skills = [
      "lengua.skill_1",
      "lengua.skill_2",
      "lengua.skill_3",
      "lengua.skill_4",
      "lengua.skill_5",
      "lengua.skill_6",
      "lengua.skill_7",
    ];

    for (const skillId of skills) {
      const slug = canonicalIdToSlug(skillId);
      expect(slugToCanonicalId(slug)).toBe(skillId);
    }
  });

  it("returns null for invalid slugs", () => {
    expect(slugToCanonicalId("")).toBeNull();
    expect(slugToCanonicalId("materia-inexistente")).toBeNull();
    expect(slugToCanonicalId("no-es-una-skill")).toBeNull();
  });

  it("accepts raw canonical IDs as slugs (backward compatibility)", () => {
    expect(slugToCanonicalId("lengua.skill_1")).toBe("lengua.skill_1");
    expect(slugToCanonicalId("lengua.skill_3.subskill_2")).toBe("lengua.skill_3.subskill_2");
  });
});

describe("readingUnitIdToSlug", () => {
  it("returns stable fixed slugs for known reading units", () => {
    const expectations: Record<string, string> = {
      "RU-LEN-BIO-001": "violeta-parra",
      "RU-LEN-CUE-001": "maquina-recuerdos-perdidos",
      "RU-LEN-ENC-001": "humedales-argentina",
      "RU-LEN-INS-001": "carta-reclamo-formal",
      "RU-LEN-LEY-001": "yaravi-flor-cantuta",
      "RU-LEN-NOT-001": "obra-teatro-potrerillos",
      "RU-LEN-INF-001": "vivero-escuela",
      "RU-LEN-NAR-001": "radio-taller",
    };

    for (const [id, expectedSlug] of Object.entries(expectations)) {
      expect(readingUnitIdToSlug(id)).toBe(expectedSlug);
    }
  });

  it("returns the input unchanged for unknown reading unit IDs", () => {
    expect(readingUnitIdToSlug("RU-NO-EXISTE-999")).toBe("RU-NO-EXISTE-999");
  });
});

describe("slugToReadingUnitId", () => {
  it("round-trips all reading unit slugs back to IDs", () => {
    const allIds = [
      "RU-LEN-BIO-001",
      "RU-LEN-CUE-001",
      "RU-LEN-ENC-001",
      "RU-LEN-INS-001",
      "RU-LEN-LEY-001",
      "RU-LEN-NOT-001",
      "RU-LEN-INF-001",
      "RU-LEN-NAR-001",
    ];

    for (const id of allIds) {
      const slug = readingUnitIdToSlug(id);
      expect(slug).not.toBe(id);
      expect(slugToReadingUnitId(slug)).toBe(id);
    }
  });

  it("accepts raw reading unit IDs (backward compatibility)", () => {
    expect(slugToReadingUnitId("RU-LEN-BIO-001")).toBe("RU-LEN-BIO-001");
    expect(slugToReadingUnitId("RU-LEN-NOT-001")).toBe("RU-LEN-NOT-001");
  });

  it("accepts legacy reading unit slugs (backward compatibility)", () => {
    expect(slugToReadingUnitId("festival-robots-memoria")).toBe("RU-LEN-NOT-001");
  });

  it("returns null for invalid reading unit slugs", () => {
    expect(slugToReadingUnitId("")).toBeNull();
    expect(slugToReadingUnitId("texto-inexistente")).toBeNull();
  });
});

// Cross-cutting: verify skill_3 multiple_choice exercises are simulator-eligible

import { loadLenguaExercises } from "../../practice/session_runner";
import { selectSimulatorSession } from "../../practice/simulator_runner";

describe("skill_3 in simulator", () => {
  it("has multiple_choice exercises compatible with simulator", () => {
    const exercises = loadLenguaExercises();
    const skill3exercises = exercises.filter(
      (e) => e.skill_id === "lengua.skill_3" && e.type === "multiple_choice",
    );

    expect(skill3exercises.length).toBeGreaterThanOrEqual(11);
  });

  it("skill_3 exercises appear in a simulator session", () => {
    const exercises = loadLenguaExercises();
    const session = selectSimulatorSession(exercises, { maxQuestions: 20 });
    const skill3InSession = session.exercises.filter(
      (e) => e.skill_id === "lengua.skill_3",
    );

    expect(skill3InSession.length).toBeGreaterThan(0);
  });
});
