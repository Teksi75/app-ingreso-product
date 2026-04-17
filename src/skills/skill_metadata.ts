export type SkillMetadata = {
  id: string;
  title: string;
  description: string;
};

const skillMetadata: Record<string, SkillMetadata> = {
  "lengua.skill_1": {
    id: "lengua.skill_1",
    title: "Comprension e inferencia textual",
    description: "Entrena entender ideas, datos e inferencias en textos breves.",
  },
  "lengua.skill_2": {
    id: "lengua.skill_2",
    title: "Estructura y secuencia discursiva",
    description: "Entrena ordenar informacion y reconocer como avanza un texto.",
  },
  "lengua.skill_3": {
    id: "lengua.skill_3",
    title: "Produccion escrita funcional",
    description: "Entrena escribir respuestas breves con proposito, foco y claridad.",
  },
  "lengua.skill_4": {
    id: "lengua.skill_4",
    title: "Morfosintaxis aplicada",
    description: "Entrena clases de palabras y relaciones gramaticales en contexto.",
  },
  "lengua.skill_5": {
    id: "lengua.skill_5",
    title: "Gestion verbal en contexto",
    description: "Entrena reconocer y usar tiempos y modos verbales con coherencia.",
  },
  "lengua.skill_6": {
    id: "lengua.skill_6",
    title: "Norma ortografica y tildacion",
    description: "Entrena acentuacion, ortografia y uso correcto de grafias.",
  },
  "lengua.skill_7": {
    id: "lengua.skill_7",
    title: "Puntuacion para sentido",
    description: "Entrena usar signos de puntuacion para ordenar y precisar el sentido.",
  },
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
  "LEN-GRAM-003": {
    id: "LEN-GRAM-003",
    title: "Funcion sintactica",
    description: "Entrena reconocer nucleos y relaciones basicas dentro de la oracion.",
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
  "LEN-TEXT-002": {
    id: "LEN-TEXT-002",
    title: "Proposito y coherencia",
    description: "Entrena reconocer propositos comunicativos y detectar rupturas de coherencia.",
  },
  "LEN-TEXT-003": {
    id: "LEN-TEXT-003",
    title: "Conectores",
    description: "Entrena elegir enlaces adecuados entre segmentos de un texto.",
  },
  "LEN-PUNC-001": {
    id: "LEN-PUNC-001",
    title: "Comas",
    description: "Entrena usar comas en enumeraciones e inserciones breves.",
  },
  "LEN-PUNC-002": {
    id: "LEN-PUNC-002",
    title: "Puntuacion y sentido",
    description: "Entrena elegir signos que fijan o cambian la interpretacion de una oracion.",
  },
  "LEN-PUNC-003": {
    id: "LEN-PUNC-003",
    title: "Segmentacion",
    description: "Entrena separar enunciados para mantener claridad y sentido.",
  },
  "LEN-WRIT-001": {
    id: "LEN-WRIT-001",
    title: "Formato breve",
    description: "Entrena producir mensajes breves con objetivo comunicativo claro.",
  },
  "LEN-WRIT-002": {
    id: "LEN-WRIT-002",
    title: "Datos relevantes",
    description: "Entrena seleccionar informacion necesaria y descartar relleno.",
  },
  "LEN-WRIT-003": {
    id: "LEN-WRIT-003",
    title: "Claridad y foco",
    description: "Entrena mejorar precision y legibilidad sin cambiar el sentido.",
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
