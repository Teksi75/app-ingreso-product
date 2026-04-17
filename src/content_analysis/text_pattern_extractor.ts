import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

export type TextPatternSummary = {
  textTypes: string[];
  avgLength: number;
  commonStructures: string[];
};

const DEFAULT_SOURCE_DIR = resolve(process.cwd(), "content_sources/lengua");
const MANUAL_EXTRACTS_DIR = "manual_extracts";

const BLOCKED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".odt"]);

export function extractTextPatterns(sourceDir = DEFAULT_SOURCE_DIR): TextPatternSummary {
  if (!existsSync(sourceDir)) {
    return {
      textTypes: [],
      avgLength: 0,
      commonStructures: [],
    };
  }

  const files = readdirSync(sourceDir)
    .filter((fileName) => fileName !== MANUAL_EXTRACTS_DIR)
    .map((fileName) => join(sourceDir, fileName))
    .filter((path) => statSync(path).isFile());

  const manualDir = join(sourceDir, MANUAL_EXTRACTS_DIR);
  const manualFiles = existsSync(manualDir)
    ? readdirSync(manualDir)
        .filter((fileName) => {
          const ext = extname(fileName).toLowerCase();
          return !BLOCKED_EXTENSIONS.has(ext);
        })
        .map((fileName) => join(manualDir, fileName))
        .filter((path) => statSync(path).isFile())
    : [];

  const allFiles = [...files, ...manualFiles];
  const textTypes = new Set<string>();
  const structures = new Set<string>();
  const lengths: number[] = [];

  for (const filePath of allFiles) {
    const extension = extname(filePath).toLowerCase();

    if (extension === ".pdf") {
      lengths.push(estimatePdfLength(filePath));
      textTypes.add("informative");
      textTypes.add("narrative");
      structures.add("title + body + exercises");
      structures.add("short text + comprehension questions");
      continue;
    }

    if (extension === ".md" || extension === ".txt") {
      const safeStats = analyzePlainTextShape(filePath);
      lengths.push(safeStats.length);

      for (const type of safeStats.textTypes) {
        textTypes.add(type);
      }

      for (const structure of safeStats.structures) {
        structures.add(structure);
      }
    }
  }

  return {
    textTypes: Array.from(textTypes).sort((left, right) => left.localeCompare(right)),
    avgLength: lengths.length > 0 ? Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : 0,
    commonStructures: Array.from(structures).sort((left, right) => left.localeCompare(right)),
  };
}

function estimatePdfLength(filePath: string): number {
  const bytes = statSync(filePath).size;
  return Math.max(1, Math.round(bytes / 1800));
}

function analyzePlainTextShape(filePath: string): {
  length: number;
  textTypes: string[];
  structures: string[];
} {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const bulletLines = lines.filter((line) => /^\s*[-*]/.test(line)).length;
  const headingLines = lines.filter((line) => /^\s*#/.test(line)).length;

  return {
    length: content.split(/\s+/).filter(Boolean).length,
    textTypes: inferTextTypesFromShape(lines, bulletLines),
    structures: inferStructuresFromShape(lines.length, headingLines, bulletLines),
  };
}

function inferTextTypesFromShape(lines: string[], bulletLines: number): string[] {
  const types = new Set<string>();

  if (bulletLines >= 3) {
    types.add("informative");
  }

  if (lines.some((line) => /\bnoticia\b|\bperiodistico\b/i.test(line))) {
    types.add("news");
  }

  if (lines.some((line) => /\bnarrativo\b|\brelato\b|\bleyenda\b/i.test(line))) {
    types.add("narrative");
  }

  if (types.size === 0) {
    types.add("informative");
  }

  return Array.from(types);
}

function inferStructuresFromShape(lineCount: number, headingLines: number, bulletLines: number): string[] {
  const structures = new Set<string>();

  if (headingLines > 0) {
    structures.add("section headings");
  }

  if (bulletLines > 0) {
    structures.add("bulleted constraints");
  }

  if (lineCount >= 6) {
    structures.add("multi-section document");
  }

  if (structures.size === 0) {
    structures.add("short continuous text");
  }

  return Array.from(structures);
}
