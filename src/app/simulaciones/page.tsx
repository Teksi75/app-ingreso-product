import {
  createSimulatorSession,
  saveSimulatorSessionProgress,
  type SimulatorAnswer,
  type SimulatorSession,
} from "../../practice/simulator_runner";
import { getNextStepRecommendation } from "../../recommendation/next_step";
import { SimulatorQuestion, type PublicSimulatorSession, type SimulatorSaveResult } from "./SimulatorQuestion";

export const dynamic = "force-dynamic";

export default function SimulacionesPage() {
  const session = createSimulatorSession();

  async function saveProgress(answers: SimulatorAnswer[]): Promise<SimulatorSaveResult> {
    "use server";

    const result = saveSimulatorSessionProgress(session, answers);
    const skillResults = result.skill_results
      .filter((skillResult) => /^lengua\.skill_\d+$/.test(skillResult.skill_id))
      .map((skillResult) => ({
        skillId: skillResult.skill_id,
        attempts: skillResult.attempts,
        correct: skillResult.correct,
        state: skillResult.state,
        masteryLevel: skillResult.mastery_level ?? 1,
      }));
    const recommendation = getNextStepRecommendation(result.progress);

    return {
      scorePercentage: result.score_percentage,
      totalCorrect: result.total_correct,
      totalAttempts: result.total_attempts,
      skillResults,
      recommendation,
    };
  }

  return (
    <SimulatorQuestion
      session={toPublicSimulatorSession(session)}
      saveProgress={saveProgress}
    />
  );
}

function toPublicSimulatorSession(session: SimulatorSession): PublicSimulatorSession {
  return {
    mode: session.mode,
    blocks: session.blocks,
    totalQuestions: session.totalQuestions,
    exercises: session.exercises.map((exercise) => ({
      id: exercise.id,
      block_id: exercise.block_id,
      skill_id: exercise.skill_id,
      subskill: exercise.subskill,
      difficulty: exercise.difficulty,
      prompt: exercise.prompt,
      options: getStableShuffledOptions(exercise.options, exercise.id),
    })),
  };
}

function getStableShuffledOptions(options: string[], exerciseId: string): string[] {
  return [...options].sort((left, right) => {
    const leftRank = getOptionRank(`${exerciseId}:${left}`);
    const rightRank = getOptionRank(`${exerciseId}:${right}`);

    return leftRank - rightRank || left.localeCompare(right);
  });
}

function getOptionRank(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
