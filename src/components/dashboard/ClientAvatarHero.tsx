"use client";

/**
 * ClientAvatarHero - AvatarHero que lee el perfil del estudiante
 * ==============================================================
 * Wrapper cliente para mostrar el avatar y nombre personalizados.
 */

import { AvatarHero } from "@/components/ui";
import { useProfile } from "@/hooks/useProfile";

export function ClientAvatarHero({
  level,
  rank,
  energy = 85,
  className = "",
}: {
  level: number;
  rank: string;
  energy?: number;
  className?: string;
}) {
  const { profile, isLoaded } = useProfile();
  const name = isLoaded ? profile.name : "Estudiante";
  const emoji = isLoaded ? profile.avatar : undefined;

  return (
    <AvatarHero
      name={name}
      level={level}
      rank={rank}
      energy={energy}
      emoji={emoji}
      className={className}
    />
  );
}
