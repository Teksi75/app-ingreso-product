import { normalizeAcceptedAnswers } from "../math/math_content";

function normalizeSingleAnswer(value: string): string {
  return normalizeAcceptedAnswers([value])[0] ?? "";
}

export function isAcceptedFreeAnswer(
  selectedAnswer: string,
  correctAnswer: string,
  acceptedAnswers?: string[],
): boolean {
  const normalizedSelected = normalizeSingleAnswer(selectedAnswer);

  if (!normalizedSelected) {
    return false;
  }

  const allowedAnswers = normalizeAcceptedAnswers([
    correctAnswer,
    ...(acceptedAnswers ?? []),
  ]);

  return allowedAnswers.includes(normalizedSelected);
}
