import { staticReadingUnits } from "../data/static_content";
import { getSkillMetadata } from "./skill_metadata";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CANONICAL_SKILL_SLUGS: Record<string, string> = {
  "lengua.skill_1": "comprension-global-del-texto",
  "lengua.skill_2": "organizacion-de-ideas",
  "lengua.skill_3": "escritura-clara-y-breve",
  "lengua.skill_4": "gramatica-en-contexto",
  "lengua.skill_5": "uso-de-verbos",
  "lengua.skill_6": "ortografia-y-tildes",
  "lengua.skill_7": "puntuacion-y-sentido",
};

const CANONICAL_SLUG_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(CANONICAL_SKILL_SLUGS).map(([id, slug]) => [slug, id]),
);

export function canonicalIdToSlug(id: string): string {
  if (CANONICAL_SKILL_SLUGS[id]) {
    return CANONICAL_SKILL_SLUGS[id];
  }

  const metadata = getSkillMetadata(id);
  if (metadata && metadata.title !== id) {
    return slugify(metadata.title);
  }

  return id;
}

export function slugToCanonicalId(slug: string): string | null {
  if (CANONICAL_SLUG_REVERSE[slug]) {
    return CANONICAL_SLUG_REVERSE[slug];
  }

  if (/^lengua\.skill_\d+(\.subskill_\d+)?$/.test(slug)) {
    return slug;
  }

  return null;
}

let readingSlugsBuilt = false;
const readingToSlug = new Map<string, string>();
const slugToReading = new Map<string, string>();

function ensureReadingSlugs(): void {
  if (readingSlugsBuilt) {
    return;
  }

  for (const rawUnit of Object.values(staticReadingUnits)) {
    const unit = rawUnit as { id?: string; title?: string };
    if (!unit?.id || !unit?.title) {
      continue;
    }

    const slug = slugify(unit.title);
    readingToSlug.set(unit.id, slug);
    slugToReading.set(slug, unit.id);
  }

  readingSlugsBuilt = true;
}

export function readingUnitIdToSlug(id: string): string {
  ensureReadingSlugs();
  return readingToSlug.get(id) ?? id;
}

export function slugToReadingUnitId(slug: string): string | null {
  ensureReadingSlugs();

  if (slugToReading.has(slug)) {
    return slugToReading.get(slug) ?? null;
  }

  if (/^RU-LEN-[A-Z]+-\d{3}$/.test(slug)) {
    return slug;
  }

  return null;
}
