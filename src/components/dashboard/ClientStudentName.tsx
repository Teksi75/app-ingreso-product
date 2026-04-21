"use client";

/**
 * ClientStudentName - Muestra el nombre del perfil del estudiante
 * =============================================================
 * Lee localStorage y muestra el nombre guardado, con fallback.
 */

import { useProfile } from "@/hooks/useProfile";

export function ClientStudentName({ fallback = "Estudiante" }: { fallback?: string }) {
  const { profile, isLoaded } = useProfile();
  if (!isLoaded) return <span>{fallback}</span>;
  return <span>{profile.name || fallback}</span>;
}
