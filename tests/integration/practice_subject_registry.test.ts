import { describe, expect, it } from "vitest";
import {
  canAccessSubjectSkill,
  createSubjectExercise,
  selectSubjectExercise,
} from "../../src/subjects/subject_registry.ts";

describe("practice subject registry", () => {
  it("selects exercises using the requested subject and keeps lengua fallback safe", () => {
    const lengua = createSubjectExercise("lengua", {
      id: "len-1",
      skill: "lengua.skill_1",
      subskill: "lengua.skill_1.subskill_1",
      difficulty: 1,
    });
    const matematica = createSubjectExercise("matematica", {
      id: "mat-a1",
      skill: "matematica.A1",
      subskill: "matematica.A1.numeros",
      difficulty: 1,
      prerequisite_focus_ids: [],
    });

    const selectedMath = selectSubjectExercise([lengua, matematica], {
      subject: "matematica",
      masteryByFocus: {},
    });
    expect(selectedMath?.id).toBe("mat-a1");

    const fallbackToLengua = selectSubjectExercise([lengua], {
      subject: "desconocida",
      masteryByFocus: {},
    });
    expect(fallbackToLengua?.subject).toBe("lengua");
  });

  it("blocks math skill when prerequisite focus is not mastered", () => {
    expect(
      canAccessSubjectSkill("matematica", {
        skillId: "matematica.A5",
        prerequisites: ["matematica.A4", "matematica.A2"],
        masteryByFocus: {
          "matematica.A4": 3,
          "matematica.A2": 1,
        },
      }),
    ).toBe(false);

    expect(
      canAccessSubjectSkill("matematica", {
        skillId: "matematica.A5",
        prerequisites: ["matematica.A4", "matematica.A2"],
        masteryByFocus: {
          "matematica.A4": 3,
          "matematica.A2": 2,
        },
      }),
    ).toBe(true);
  });
});
