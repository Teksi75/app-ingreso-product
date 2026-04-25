"use client";

/**
 * useProfile - Hook para gestionar el perfil del usuario
 * ================================================
 * Lee y persiste un perfil local y minimo en localStorage.
 * No guarda email, edad, escuela ni ningun dato de contacto.
 */

import { useState, useEffect, useCallback } from "react";

export type LearningGoal = "daily_practice" | "exam_training" | "strengthen_weak_skills";
export type PreferredSubject = "lengua" | "matematica" | "ambas";

export type UserProfile = {
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  learningGoal: LearningGoal;
  preferredSubject: PreferredSubject;
  settings: {
    localReminders: boolean;
    sound: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    localOnly: true;
    privateDataStored: false;
    instituteSync: false;
  };
};

const STORAGE_KEY = "teksti75_profile";
const PROFILE_UPDATED_EVENT = "teksti75_profile_updated";
const DEFAULT_AVATAR = "🎓";
const DEFAULT_NAME = "Estudiante";

const DEFAULT_SETTINGS: UserProfile["settings"] = {
  localReminders: true,
  sound: true,
  reducedMotion: false,
};

function createDefaultProfile(now = new Date().toISOString()): UserProfile {
  return {
    name: DEFAULT_NAME,
    avatar: DEFAULT_AVATAR,
    createdAt: now,
    updatedAt: now,
    learningGoal: "daily_practice",
    preferredSubject: "lengua",
    settings: DEFAULT_SETTINGS,
    privacy: {
      localOnly: true,
      privateDataStored: false,
      instituteSync: false,
    },
  };
}

function loadProfileFromStorage(): UserProfile {
  if (typeof window === "undefined") {
    return createDefaultProfile();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile> & Record<string, unknown>;
      const now = new Date().toISOString();

      return {
        ...createDefaultProfile(now),
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : DEFAULT_NAME,
        avatar: typeof parsed.avatar === "string" && parsed.avatar ? parsed.avatar : DEFAULT_AVATAR,
        createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : now,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : now,
        learningGoal: isLearningGoal(parsed.learningGoal) ? parsed.learningGoal : "daily_practice",
        preferredSubject: isPreferredSubject(parsed.preferredSubject) ? parsed.preferredSubject : "lengua",
        settings: {
          ...DEFAULT_SETTINGS,
          ...(isPlainObject(parsed.settings) ? parsed.settings : {}),
        },
      };
    }
  } catch {
    // ignorar errores de parseo
  }
  return createDefaultProfile();
}

function saveProfileToStorage(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile }));
  }, 0);
}

function isLearningGoal(value: unknown): value is LearningGoal {
  return value === "daily_practice" || value === "exam_training" || value === "strengthen_weak_skills";
}

function isPreferredSubject(value: unknown): value is PreferredSubject {
  return value === "lengua" || value === "matematica" || value === "ambas";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(createDefaultProfile());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfileState(loadProfileFromStorage());
    setIsLoaded(true);

    function handleProfileUpdated(event: Event) {
      const nextProfile = event instanceof CustomEvent
        ? event.detail
        : loadProfileFromStorage();

      if (isPlainObject(nextProfile)) {
        setProfileState(loadProfileFromStorage());
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setProfileState(loadProfileFromStorage());
      }
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setProfile = useCallback((updater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };

      if (!next.name || !next.name.trim()) {
        next.name = DEFAULT_NAME;
      }

      next.name = next.name.trim();
      next.updatedAt = new Date().toISOString();
      next.privacy = {
        localOnly: true,
        privateDataStored: false,
        instituteSync: false,
      };

      saveProfileToStorage(next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(() => {
    const next = createDefaultProfile();
    saveProfileToStorage(next);
    setProfileState(next);
  }, []);

  return { profile, setProfile, resetProfile, isLoaded };
}
