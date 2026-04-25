import { NextResponse, type NextRequest } from "next/server";
import { buildProgressSummary } from "@/app/progress_summary";
import { normalizeProgressCode } from "@/app/student_identity";
import { loadProgressAsync } from "@/storage/local_progress_store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = normalizeProgressCode(request.nextUrl.searchParams.get("code") ?? request.nextUrl.searchParams.get("student"));
  const studentCode = code ?? "default";
  const progress = await loadProgressAsync(studentCode);
  const summary = buildProgressSummary(progress);

  return NextResponse.json({
    studentCode,
    generatedAt: new Date().toISOString(),
    summary,
  });
}
