import { cookies } from "next/headers";

export const progressCookieName = "teksi75_progress";
export const defaultProgressCode = "default";

export type StudentIdentity = {
  code: string;
};

export async function resolveStudentIdentity(explicitCode?: string | null): Promise<StudentIdentity> {
  const codeFromQuery = normalizeProgressCode(explicitCode);

  if (codeFromQuery) {
    return { code: codeFromQuery };
  }

  const cookieStore = await cookies();
  const codeFromCookie = normalizeProgressCode(cookieStore.get(progressCookieName)?.value);

  return { code: codeFromCookie ?? defaultProgressCode };
}

export async function resolveStudentCode(explicitCode?: string | null): Promise<string> {
  const identity = await resolveStudentIdentity(explicitCode);
  return identity.code;
}

export function normalizeProgressCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9_-]{4,64}$/.test(normalized) ? normalized : null;
}

// Futuro: la licencia por cohorte debe vivir en src/licensing y envolver esta identidad.
// El progreso conserva su codigo anonimo; la licencia solo decide si el acceso esta activo,
// en consulta o expirado.
