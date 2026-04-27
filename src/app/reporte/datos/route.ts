import { NextResponse, type NextRequest } from "next/server";
import { buildProgressSummary, formatDuration, type ProgressSummary } from "@/app/progress_summary";
import { normalizeProgressCode } from "@/app/student_identity";
import { loadProgressAsync } from "@/storage/local_progress_store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = normalizeProgressCode(request.nextUrl.searchParams.get("code") ?? request.nextUrl.searchParams.get("student"));
  const studentCode = code ?? "default";
  const progress = await loadProgressAsync(studentCode);
  const summary = buildProgressSummary(progress);
  const generatedAt = new Date();

  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json({
      studentCode,
      generatedAt: generatedAt.toISOString(),
      summary,
    });
  }

  return new NextResponse(buildReadableReport(studentCode, generatedAt, summary), {
    headers: {
      "Content-Disposition": `attachment; filename="reporte-${studentCode}.txt"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function buildReadableReport(studentCode: string, generatedAt: Date, summary: ProgressSummary): string {
  const lines = [
    "INGENIUM - Reporte de progreso",
    "================================",
    "",
    `Código de progreso: ${studentCode}`,
    `Generado: ${formatDateTime(generatedAt)}`,
    "",
    "Resumen general",
    "---------------",
    `Ejercicios realizados: ${summary.totalAttempts}`,
    `Respuestas correctas: ${summary.totalCorrect}`,
    `Errores: ${summary.totalErrors}`,
    `Sesiones completadas: ${summary.totalSessions}`,
    `Días activos: ${summary.activeDays}`,
    `Precisión general: ${summary.accuracy}%`,
    `Tiempo total: ${formatDuration(summary.totalDurationSeconds)}`,
    `Última sesión: ${summary.lastSessionAt ? formatDateTime(new Date(summary.lastSessionAt)) : "Sin sesiones registradas"}`,
    "",
    "Actividad de los últimos 7 días",
    "-------------------------------",
    ...summary.weeklyData.map((day) => (
      `${day.day} ${day.date}: ${day.exercises} ejercicios, ${day.accuracy}% precisión`
    )),
    "",
    "Lengua por habilidad",
    "--------------------",
    ...summary.skills.map((skill) => [
      `${skill.title}`,
      `  Nivel: ${skill.masteryLevel}`,
      `  Estado: ${formatState(skill.state)}`,
      `  Ejercicios: ${skill.attempts}`,
      `  Correctas: ${skill.correct}`,
      `  Precisión: ${skill.accuracy}%`,
      `  Puntaje de dominio: ${skill.masteryScore}%`,
    ].join("\n")),
    "",
    "Nota",
    "----",
    "Este reporte no incluye datos personales. Solo muestra el progreso asociado al código indicado.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function formatState(state: string): string {
  const labels: Record<string, string> = {
    mastered: "Dominado",
    developing: "En desarrollo",
    weak: "A reforzar",
    not_started: "Sin iniciar",
  };

  return labels[state] ?? state;
}
