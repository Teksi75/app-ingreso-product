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

const READING_UNIT_SLUGS: Record<string, string> = {
  "RU-LEN-BIO-001": "violeta-parra",
  "RU-LEN-CUE-001": "maquina-recuerdos-perdidos",
  "RU-LEN-ENC-001": "humedales-argentina",
  "RU-LEN-INS-001": "carta-reclamo-formal",
  "RU-LEN-LEY-001": "yaravi-flor-cantuta",
  "RU-LEN-NOT-001": "obra-teatro-potrerillos",
  "RU-LEN-INF-001": "vivero-escuela",
  "RU-LEN-NAR-001": "radio-taller",
};

const READING_UNIT_SLUG_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(READING_UNIT_SLUGS).map(([id, slug]) => [slug, id]),
);

const READING_UNIT_SLUG_ALIASES: Record<string, string> = {
  "festival-robots-memoria": "RU-LEN-NOT-001",
};

export function readingUnitIdToSlug(id: string): string {
  return READING_UNIT_SLUGS[id] ?? id;
}

export function slugToReadingUnitId(slug: string): string | null {
  if (READING_UNIT_SLUG_REVERSE[slug]) {
    return READING_UNIT_SLUG_REVERSE[slug];
  }

  if (READING_UNIT_SLUG_ALIASES[slug]) {
    return READING_UNIT_SLUG_ALIASES[slug];
  }

  if (/^RU-LEN-[A-Z]+-\d{3}$/.test(slug)) {
    return slug;
  }

  return null;
}
