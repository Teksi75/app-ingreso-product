export type SkillMetadata = {
  id: string;
  title: string;
  description: string;
};

const skillMetadata: Record<string, SkillMetadata> = {
  "LEN-COMP-001": {
    id: "LEN-COMP-001",
    title: "Tema central",
    description: "Entrena la identificacion de la idea principal en textos breves.",
  },
  "LEN-COMP-002": {
    id: "LEN-COMP-002",
    title: "Datos e inferencias",
    description: "Entrena localizar informacion explicita y distinguirla de lo que se deduce.",
  },
  "LEN-COMP-003": {
    id: "LEN-COMP-003",
    title: "Inferencia causal",
    description: "Entrena deducir causas, consecuencias o motivos que el texto no dice de forma directa.",
  },
  "LEN-COMP-004": {
    id: "LEN-COMP-004",
    title: "Intencion del texto",
    description: "Entrena reconocer para que fue escrito un texto y que busca provocar en el lector.",
  },
  "LEN-GRAM-001": {
    id: "LEN-GRAM-001",
    title: "Tiempos verbales",
    description: "Entrena elegir formas verbales coherentes con el tiempo y la secuencia de acciones.",
  },
  "LEN-GRAM-002": {
    id: "LEN-GRAM-002",
    title: "Concordancia gramatical",
    description: "Entrena mantener acuerdo de genero, numero y persona dentro de la oracion.",
  },
  "LEN-NORM-001": {
    id: "LEN-NORM-001",
    title: "Ortografia de uso",
    description: "Entrena seleccionar grafias correctas en palabras de confusion frecuente.",
  },
  "LEN-NORM-002": {
    id: "LEN-NORM-002",
    title: "Acentuacion",
    description: "Entrena aplicar tildes y reglas de acentuacion en palabras y frases.",
  },
  "LEN-NORM-003": {
    id: "LEN-NORM-003",
    title: "Diptongo, hiato y triptongo",
    description: "Entrena reconocer como se agrupan o separan vocales dentro de las silabas.",
  },
  "LEN-TEXT-001": {
    id: "LEN-TEXT-001",
    title: "Coherencia textual",
    description: "Entrena ordenar ideas y sostener un hilo claro entre partes de un texto.",
  },
  "LEN-VOC-001": {
    id: "LEN-VOC-001",
    title: "Vocabulario por contexto",
    description: "Entrena inferir significados a partir de pistas cercanas en el texto.",
  },
  "LEN-VOC-002": {
    id: "LEN-VOC-002",
    title: "Sinonimos en contexto",
    description: "Entrena reemplazar palabras sin cambiar el sentido ni la intensidad del texto.",
  },
};

export function getSkillMetadata(skillId: string): SkillMetadata {
  return (
    skillMetadata[skillId] ?? {
      id: skillId,
      title: skillId,
      description: "Entrena una habilidad de Lengua registrada en el progreso.",
    }
  );
}
