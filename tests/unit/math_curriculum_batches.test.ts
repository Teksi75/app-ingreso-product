import { describe, expect, it } from "vitest";
import { getMatematicaManifestSkills } from "../../src/practice/session_runner";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readExercises(fileName: string): Array<Record<string, unknown>> {
  const raw = readFileSync(resolve(process.cwd(), "content", "matematica", fileName), "utf-8");
  return JSON.parse(raw).exercises;
}

describe("math curriculum batches", () => {
  it("keeps manifest skills ordered from A1 to A9", () => {
    expect(getMatematicaManifestSkills()).toEqual([
      "matematica.A1",
      "matematica.A2",
      "matematica.A3",
      "matematica.A4",
      "matematica.A5",
      "matematica.A6",
      "matematica.A7",
      "matematica.A8",
      "matematica.A9",
    ]);
  });

  it("covers A1 with resta, multiplicación, división y multi-step", () => {
    const exercises = readExercises("a1_operaciones.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    expect(prompts).toContain("-");
    expect(prompts).toContain("×");
    expect(prompts).toContain("÷");
    expect(prompts).toContain("pasos");
  });

  it("covers A4 divisores, múltiplos, MCM y MCD", () => {
    const exercises = readExercises("a4_mcm_mcd.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    expect(prompts).toContain("divisor");
    expect(prompts).toContain("múltipl");
    expect(prompts).toContain("mcm");
    expect(prompts).toContain("mcd");
  });

  it("covers A5 porcentajes y proporcionalidad directa/inversa", () => {
    const exercises = readExercises("a5_porcentajes.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    expect(prompts).toContain("%");
    expect(prompts).toContain("directa");
    expect(prompts).toContain("inversa");
  });

  it("covers A7 SIMELA breadth across longitudes, capacidad y tiempo", () => {
    const exercises = readExercises("a7_simela.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    expect(prompts).toContain("km");
    expect(prompts).toContain("l");
    expect(prompts).toContain("hora");
  });

  it("covers A8 with perímetro and área", () => {
    const exercises = readExercises("a8_perimetros_areas.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    expect(prompts).toContain("perímetro");
    expect(prompts).toContain("área");
  });

  it("covers A2 with exact powers and exact roots only", () => {
    const exercises = readExercises("a2_potencias_raices.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    const content = exercises
      .map((exercise) => JSON.stringify(exercise.content ?? []))
      .join(" ")
      .toLowerCase();
    const feedback = exercises
      .map((exercise) => String(exercise.feedback_incorrect ?? ""))
      .join(" ")
      .toLowerCase();

    expect(prompts).toContain("potencia");
    expect(prompts).toContain("raíz");
    expect(content).not.toContain("<mn>2</mn></msqrt>");
    expect(content).not.toContain("<mn>3</mn></msqrt>");
    expect(feedback).toContain("exact");
  });

  it("covers A3 with simplification and ordering/comparison behaviors", () => {
    const exercises = readExercises("a3_fracciones_decimales.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    expect(prompts).toContain("convert");
    expect(prompts).toContain("simplific");
    expect(prompts).toMatch(/orden|compar/);
  });

  it("covers A6 additive and multiplicative one-step equations with rendered steps", () => {
    const exercises = readExercises("a6_ecuaciones.json");
    const prompts = exercises.map((exercise) => String(exercise.prompt ?? "")).join(" ").toLowerCase();
    const feedbackStepsJson = exercises
      .map((exercise) => JSON.stringify(exercise.feedback_steps ?? []))
      .join(" ")
      .toLowerCase();
    const hasStepsNode = exercises.some((exercise) => {
      const feedback = exercise.feedback_steps;
      if (!Array.isArray(feedback)) {
        return false;
      }

      return feedback.some((node) => !!node && typeof node === "object" && (node as { type?: string }).type === "steps");
    });

    expect(prompts).toContain("+");
    expect(prompts).toContain("x");
    expect(prompts).toContain("=");
    expect(prompts).toMatch(/·|\*/);
    expect(hasStepsNode).toBe(true);
    expect(feedbackStepsJson).toContain("<mi>x</mi><mo>+</mo><mn>7</mn><mo>=</mo><mn>12</mn>");
    expect(feedbackStepsJson).toContain("<mn>3</mn><mo>·</mo><mi>x</mi><mo>=</mo><mn>21</mn>");
  });
});
