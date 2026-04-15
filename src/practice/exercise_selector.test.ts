import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { selectNextExercise, testSelector, type Exercise, type HistoryItem, type RuleApplied } from "./exercise_selector";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function hasNoImmediateLoops(history: HistoryItem[]): boolean {
  for (let index = 1; index < history.length; index += 1) {
    if (history[index].exercise_id === history[index - 1].exercise_id) {
      return false;
    }
  }

  return true;
}

function validatePriorityAndRuleC(traces: ReturnType<typeof testSelector>): void {
  assert(traces.length === 3, "testSelector debe devolver 3 escenarios.");

  const [recurrent, streak, highPrecision] = traces;

  assert(recurrent.ruleApplied === "A", "Error recurrente debe activar Regla A.");
  assert(streak.ruleApplied === "D", "Racha positiva debe activar Regla D.");
  assert(highPrecision.ruleApplied === "C", "Alta precision debe activar Regla C.");

  assert(
    highPrecision.skill === "LEN-READ-001",
    "Regla C debe mantener la misma skill en escenario de alta precision.",
  );
}

function loadRealExercises(): Exercise[] {
  const datasetPath = resolve(process.cwd(), "docs/04_exercise_engine/lengua_exercises_modulo3.json");
  const raw = JSON.parse(readFileSync(datasetPath, "utf8")) as { exercises: Exercise[] };

  assert(Array.isArray(raw.exercises), "El dataset real no contiene arreglo de ejercicios.");
  assert(raw.exercises.length > 0, "El dataset real no tiene ejercicios.");

  return raw.exercises;
}

function simulateScenario(
  scenarioName: string,
  initialHistory: HistoryItem[],
  exercises: Exercise[],
  iterations: number,
): { history: HistoryItem[]; rules: RuleApplied[] } {
  const history = [...initialHistory];
  const rules: RuleApplied[] = [];

  for (let index = 0; index < iterations; index += 1) {
    const selected = selectNextExercise(history, exercises);
    const { exercise, trace } = selected;

    assert(Boolean(exercise.id), `${scenarioName}: selector devolvio ejercicio sin id.`);
    assert(Boolean(exercise.skill_id), `${scenarioName}: selector devolvio ejercicio sin skill.`);
    assert(Boolean(exercise.subskill), `${scenarioName}: selector devolvio ejercicio sin subskill.`);
    assert([1, 2, 3].includes(exercise.difficulty), `${scenarioName}: selector devolvio dificultad invalida.`);

    console.log(`[real:${scenarioName}]`);
    console.log(
      `ruleApplied=${trace.ruleApplied} | skill=${trace.skill} | subskill=${trace.subskill} | difficulty=${trace.difficulty}`,
    );

    rules.push(trace.ruleApplied);

    let result: "correct" | "incorrect" = "correct";

    if (scenarioName === "errores recurrentes") {
      result = index % 3 === 0 ? "correct" : "incorrect";
    }

    if (scenarioName === "racha positiva") {
      result = "correct";
    }

    if (scenarioName === "alta precision") {
      result = index === iterations - 1 ? "incorrect" : "correct";
    }

    history.push({
      exercise_id: exercise.id,
      skill_id: exercise.skill_id,
      subskill: exercise.subskill,
      difficulty: exercise.difficulty,
      result,
    });
  }

  return { history, rules };
}

function runRealValidation(exercises: Exercise[]): void {
  const bySkill = exercises.reduce<Record<string, Exercise[]>>((acc, exercise) => {
    acc[exercise.skill_id] ??= [];
    acc[exercise.skill_id].push(exercise);
    return acc;
  }, {});

  const pickSkillWithAtLeast = (minItems: number): string => {
    const found = Object.entries(bySkill).find(([, items]) => items.length >= minItems);
    assert(Boolean(found), `No existe skill con al menos ${minItems} ejercicios en dataset real.`);
    return found![0];
  };

  const recurrentSkill = pickSkillWithAtLeast(2);
  const recurrentExercises = bySkill[recurrentSkill];
  const otherSkillExercise = exercises.find((e) => e.skill_id !== recurrentSkill) ?? recurrentExercises[0];

  const recurrentHistory: HistoryItem[] = [
    {
      exercise_id: recurrentExercises[0].id,
      skill_id: recurrentExercises[0].skill_id,
      subskill: recurrentExercises[0].subskill,
      difficulty: recurrentExercises[0].difficulty,
      result: "incorrect",
    },
    {
      exercise_id: recurrentExercises[1].id,
      skill_id: recurrentExercises[1].skill_id,
      subskill: recurrentExercises[1].subskill,
      difficulty: recurrentExercises[1].difficulty,
      result: "incorrect",
    },
    {
      exercise_id: otherSkillExercise.id,
      skill_id: otherSkillExercise.skill_id,
      subskill: otherSkillExercise.subskill,
      difficulty: otherSkillExercise.difficulty,
      result: "correct",
    },
  ];

  const streakSkill = pickSkillWithAtLeast(2);
  const streakExercises = bySkill[streakSkill];
  const streakHistory: HistoryItem[] = [
    {
      exercise_id: streakExercises[0].id,
      skill_id: streakExercises[0].skill_id,
      subskill: streakExercises[0].subskill,
      difficulty: streakExercises[0].difficulty,
      result: "correct",
    },
    {
      exercise_id: streakExercises[1].id,
      skill_id: streakExercises[1].skill_id,
      subskill: streakExercises[1].subskill,
      difficulty: streakExercises[1].difficulty,
      result: "correct",
    },
  ];

  const highPrecisionSkill = pickSkillWithAtLeast(3);
  const highPrecisionExercises = bySkill[highPrecisionSkill];
  const highPrecisionHistory: HistoryItem[] = [
    {
      exercise_id: highPrecisionExercises[0].id,
      skill_id: highPrecisionExercises[0].skill_id,
      subskill: highPrecisionExercises[0].subskill,
      difficulty: highPrecisionExercises[0].difficulty,
      result: "correct",
    },
    {
      exercise_id: highPrecisionExercises[1].id,
      skill_id: highPrecisionExercises[1].skill_id,
      subskill: highPrecisionExercises[1].subskill,
      difficulty: highPrecisionExercises[1].difficulty,
      result: "correct",
    },
    {
      exercise_id: highPrecisionExercises[2].id,
      skill_id: highPrecisionExercises[2].skill_id,
      subskill: highPrecisionExercises[2].subskill,
      difficulty: highPrecisionExercises[2].difficulty,
      result: "correct",
    },
  ];

  const recurrentResult = simulateScenario("errores recurrentes", recurrentHistory, exercises, 6);
  const streakResult = simulateScenario("racha positiva", streakHistory, exercises, 6);
  const highPrecisionResult = simulateScenario("alta precision", highPrecisionHistory, exercises, 6);

  assert(recurrentResult.rules.includes("A"), "Escenario real de errores recurrentes no activo Regla A.");
  assert(streakResult.rules.some((rule) => ["D", "C", "E"].includes(rule)), "Racha positiva no activo D/C/E.");
  assert(highPrecisionResult.rules.includes("C"), "Alta precision real no activo Regla C.");

  assert(hasNoImmediateLoops(recurrentResult.history), "Errores recurrentes: hay repeticion inmediata de ejercicio.");
  assert(hasNoImmediateLoops(streakResult.history), "Racha positiva: hay repeticion inmediata de ejercicio.");
  assert(hasNoImmediateLoops(highPrecisionResult.history), "Alta precision: hay repeticion inmediata de ejercicio.");

  const partialDataset = exercises.slice(0, Math.max(2, Math.floor(exercises.length / 5)));
  const partialSelection = selectNextExercise(recurrentHistory, partialDataset);

  assert(Boolean(partialSelection.exercise.id), "Dataset parcial: selector no devolvio ejercicio valido.");
}

function run(): void {
  const logs: string[] = [];
  const originalLog = console.log;

  try {
    console.log = (...args: unknown[]) => {
      const line = args.map((arg) => String(arg)).join(" ");
      logs.push(line);
      originalLog(...args);
    };

    const traces = testSelector();

    for (const trace of traces) {
      assert(Boolean(trace.ruleApplied), "Cada trace debe incluir ruleApplied.");
      assert(Boolean(trace.skill), "Cada trace debe incluir skill.");
      assert(Boolean(trace.subskill), "Cada trace debe incluir subskill.");
      assert([1, 2, 3].includes(trace.difficulty), "Cada trace debe incluir difficulty valido.");
    }

    validatePriorityAndRuleC(traces);

    const realExercises = loadRealExercises();
    runRealValidation(realExercises);

    const joined = logs.join("\n");
    const requiredFields = ["ruleApplied=", "skill=", "subskill=", "difficulty="];

    for (const field of requiredFields) {
      assert(joined.includes(field), `Falta campo obligatorio en logs: ${field}`);
    }

    assert(joined.includes("[scenario:error recurrente]"), "Debe loguear escenario base de error recurrente.");
    assert(joined.includes("[scenario:racha positiva]"), "Debe loguear escenario base de racha positiva.");
    assert(joined.includes("[scenario:alta precision]"), "Debe loguear escenario base de alta precision.");

    originalLog("exercise selector fully validated");
  } finally {
    console.log = originalLog;
  }
}

run();
