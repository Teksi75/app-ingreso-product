"use client";

import { useProfile } from "@/hooks/useProfile";

export function ClientAvatarBadge({ fallback = "🎓" }: { fallback?: string }) {
  const { profile, isLoaded } = useProfile();

  return <span suppressHydrationWarning>{isLoaded ? profile.avatar || fallback : fallback}</span>;
}
