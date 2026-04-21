"use client";

/**
 * useProfile - Hook para gestionar el perfil del usuario
 * ================================================
 * Lee y persiste el perfil en localStorage.
 * Solo el nombre es obligatorio; el resto de campos son opcionales.
 */

import { useState, useEffect, useCallback } from "react";

export type UserProfile = {
  name: string;
  email?: string;
  age?: string;
  school?: string;
  avatar?: string;
};

const STORAGE_KEY = "teksti75_profile";
const DEFAULT_AVATAR = "🎓";
const DEFAULT_NAME = "Estudiante";

function loadProfileFromStorage(): UserProfile {
  if (typeof window === "undefined") {
    return { name: DEFAULT_NAME, avatar: DEFAULT_AVATAR };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      return {
        name: parsed.name?.trim() || DEFAULT_NAME,
        email: parsed.email || "",
        age: parsed.age || "",
        school: parsed.school || "",
        avatar: parsed.avatar || DEFAULT_AVATAR,
      };
    }
  } catch {
    // ignorar errores de parseo
  }
  return { name: DEFAULT_NAME, avatar: DEFAULT_AVATAR };
}

function saveProfileToStorage(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>({ name: DEFAULT_NAME, avatar: DEFAULT_AVATAR });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfileState(loadProfileFromStorage());
    setIsLoaded(true);
  }, []);

  const setProfile = useCallback((updater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      // Normalizar nombre: si viene vacío, usar default
      if (!next.name || !next.name.trim()) {
        next.name = DEFAULT_NAME;
      }
      saveProfileToStorage(next);
      return next;
    });
  }, []);

  return { profile, setProfile, isLoaded };
}
