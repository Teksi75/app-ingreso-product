# Búsqueda de estímulos lectores candidatos

## Objetivo

Definir cómo buscar, evaluar e incorporar textos alternativos a los materiales oficiales sin convertirlos en unidades didácticas visibles.

El objetivo es construir un banco propio de estímulos lectores que permitan entrenar skills de Lengua con contenido original, legalmente compatible y pedagógicamente trazable.

Los textos no se aceptan porque "se parecen" a un módulo oficial. Se aceptan si permiten entrenar habilidades transferibles mediante preguntas mapeadas a `skill_id` y `subskill`.

## Principio rector

Cada candidato debe funcionar como estímulo lector reutilizable:

- texto base o fragmento visible cuando una skill lo requiere;
- al menos 3 preguntas posibles;
- cobertura de comprensión lectora y reflexión sobre la lengua;
- metadatos suficientes para justificar tipo textual, fuente, tema, dificultad y skills entrenables;
- uso subordinado al selector por skills.

La unidad pedagógica del producto sigue siendo:

```text
skill_id + subskill + intento evaluable
```

El TextGroup o estímulo lector es infraestructura interna. No debe convertirse en biblioteca, módulo visible ni progreso por lectura completada.

## Rol de los módulos

Las referencias a módulos sirven solo como matriz interna de cobertura:

- indican clases textuales esperadas;
- orientan rasgos lingüísticos a cubrir;
- ayudan a auditar sustitutos legales;
- permiten verificar que el banco no deja huecos relevantes.

`module_fit` nunca debe organizar la experiencia del alumno. El campo principal para aceptar y seleccionar un texto es `trainable_skills`.

## Familias de búsqueda abiertas

El banco debe poder crecer con cinco familias textuales:

1. Biografía.
2. Noticia periodística.
3. Leyenda.
4. Artículo enciclopédico.
5. Cuento o narración integradora.

Cada familia puede tener varios candidatos. La prioridad no es completar una secuencia por módulo, sino ampliar la variedad de estímulos para practicar skills en contexto.

## Restricciones de contenido

No se deben incorporar:

- textos oficiales de exámenes, cuadernillos institucionales o materiales de ingreso;
- adaptaciones demasiado cercanas a textos oficiales;
- noticias, artículos o fragmentos con licencia dudosa;
- textos con licencia que prohíba obras derivadas;
- textos con licencia no comercial si el producto se proyecta como comercial, salvo decisión explícita posterior;
- textos que requieran imagen, mapa o gráfico obligatorio para entender el estímulo;
- textos con carga ideológica, religiosa, partidaria o sensible que distraiga del objetivo lingüístico;
- textos demasiado largos para sostener práctica breve;
- textos sin skills evaluables explícitas.

## Fuentes candidatas

Prioridad alta:

1. Textos originales redactados internamente a partir de una ficha pedagógica.
2. Textos en dominio público verificable.
3. Textos con licencia CC BY o CC BY-SA, si se conserva atribución y licencia.
4. Relatos tradicionales reescritos internamente desde fuentes múltiples, sin copiar una versión moderna protegida.

Prioridad media:

1. Fuentes gubernamentales o educativas con licencia clara y compatible.
2. Artículos enciclopédicos abiertos que permitan adaptación.
3. Biografías de personajes históricos fallecidos hace suficiente tiempo, siempre que el texto usado sea propio o de fuente libre.

Prioridad baja:

1. Sitios periodísticos actuales.
2. Blogs personales.
3. Materiales didácticos comerciales.
4. Textos sin página de licencia o sin autor/fuente identificable.

## Flujo de búsqueda

### 1. Extraer la necesidad como cobertura interna

Para cada hueco de cobertura, registrar:

- clase textual requerida;
- longitud aproximada;
- skills y subskills a entrenar;
- paratextos necesarios;
- rasgos lingüísticos que deben aparecer;
- cantidad mínima de preguntas que puede sostener;
- relación interna con módulos, si corresponde.

Mapa actual de cobertura interna:

| Cobertura interna | Clase textual principal | Función esperada |
|---|---|---|
| Módulos 1-2 | Biografía | Paratexto, clase textual, párrafo, cotexto, sustantivos, adjetivos, verbos, pronombres, acentuación, coma |
| Módulo 3 | Noticia periodística | Paratextos periodísticos, comprensión, diptongo/triptongo/hiato, modos y tiempos verbales |
| Módulo 4 | Leyenda | Narrador, cohesión, coherencia, conectores, posesivos, demostrativos, uso de B/V |
| Módulo 5 | Artículo enciclopédico y leyenda | Comprensión expositiva, adverbios, sintaxis, sujeto/predicado, complementos, uso de C/S/Z |
| Módulo 6 | Cuento o narración integradora | Integración de comprensión, clases textuales, gramática, sintaxis y ortografía |

Estas etiquetas son internas. La búsqueda debe registrar `trainable_skills` como criterio principal.

### 2. Redactar una ficha de búsqueda

Antes de buscar o redactar, crear una ficha:

```text
Tipo textual:
Tema deseado:
Longitud objetivo:
Skills entrenables:
Subskills entrenables:
Paratextos requeridos:
Rasgos lingüísticos necesarios:
Restricciones legales:
Riesgos de sensibilidad:
Dificultad:
Cantidad esperada de preguntas:
Cobertura interna/module_fit:
Decisión esperada: aceptar / adaptar / descartar
```

### 3. Buscar por función, no por título

Las consultas deben combinar tipo textual, tema, licencia y rasgos útiles:

- `biografía científica dominio público niños`
- `biografía escritora argentina licencia creative commons`
- `leyenda argentina dominio público texto`
- `relato tradicional mendocino dominio público`
- `artículo enciclopédico patrimonio natural licencia abierta`
- `noticia cultural licencia creative commons`
- `texto expositivo geografía argentina licencia abierta`

Para noticias, la opción preferente es no copiar una noticia real. Conviene crear una noticia original basada en un hecho cultural o comunitario no sensible, con estructura periodística completa: volanta, título, copete, fuente interna, fecha, cuerpo y autor institucional propio.

### 4. Registrar candidatos

Cada texto encontrado, propuesto o redactado debe quedar registrado antes de adaptarse:

```text
ID candidato:
Título:
Tipo textual:
Tema:
Fuente URL o fuente interna:
Autor:
Licencia:
Permite adaptación: sí/no
Permite uso comercial: sí/no/no definido
Palabras aproximadas:
Párrafos:
Paratextos disponibles:
Trainable skills:
Rasgos lingüísticos útiles:
Cobertura interna/module_fit:
Riesgos:
Decisión: aceptar / adaptar / descartar
Motivo:
```

### 5. Evaluar con rúbrica

Un texto pasa a banco candidato si cumple todos los criterios obligatorios y al menos 4 criterios pedagógicos.

Criterios obligatorios:

- licencia clara o autoría interna;
- no reproduce material oficial;
- permite crear preguntas derivadas;
- tiene una clase textual identificable;
- declara `trainable_skills`;
- puede sostener mínimo 3 preguntas;
- es comprensible sin imagen obligatoria;
- no contiene información riesgosa para menores;
- es apto para estudiantes de 11-12 años.

Criterios pedagógicos:

- tiene vocabulario con palabras inferibles por cotexto;
- incluye suficientes sustantivos, adjetivos, verbos y pronombres analizables;
- está organizado en párrafos claros;
- permite preguntas literales e inferenciales;
- contiene conectores reconocibles;
- tiene marcas temporales o causales;
- incluye paratextos relevantes;
- se puede adaptar a 350-900 palabras sin perder sentido;
- admite dificultad graduable.

## Criterios específicos por tipo textual

### Biografía

Uso interno principal: cobertura de habilidades asociadas a módulos 1 y 2.

Características requeridas:

- 600 a 850 palabras para texto principal; 350 a 550 si es versión inicial corta;
- tercera persona;
- orden cronológico dominante;
- fechas, lugares, nombres propios y hechos verificables;
- párrafos que desarrollen etapas de vida;
- fuente o nota de procedencia;
- vocabulario con adjetivos calificativos y gentilicios;
- variedad de sustantivos propios, comunes, concretos y abstractos;
- verbos en pasado y conectores temporales.

Debe permitir preguntas sobre:

- propósito de la biografía;
- tema central;
- orden de acontecimientos;
- paratextos;
- cantidad o función de párrafos;
- significado por cotexto;
- sinónimos y antónimos;
- pronombres;
- acentuación;
- sustantivos, adjetivos y uso de mayúsculas.

Temas recomendados:

- escritores, científicas, artistas, deportistas o exploradores de relevancia cultural;
- figuras con vida documentada y baja controversia;
- personajes que permitan conectar logros con perseverancia, creatividad o aporte social.

### Noticia periodística

Uso interno principal: cobertura de habilidades asociadas a módulo 3.

Características requeridas:

- 350 a 600 palabras;
- estructura con volanta o sección, título, copete, fecha, fuente/autor y cuerpo;
- acontecimiento claro y cerrado;
- tema cultural, científico, ambiental o comunitario;
- datos que respondan qué, quién, cuándo, dónde, cómo y por qué;
- verbos en pasado para hechos ocurridos y futuro/condicional si hay proyección;
- palabras con diptongo, hiato y, si es posible, triptongo;
- vocabulario que permita inferencia por cotexto.

Debe permitir preguntas sobre:

- clase textual;
- paratextos periodísticos;
- fuente;
- tema y propósito;
- información explícita;
- diptongo, triptongo e hiato;
- modo y tiempo verbal;
- reconstrucción de datos de la noticia.

Recomendación operativa:

- producir noticias originales internas a partir de eventos ficticios verosímiles o hechos públicos no sensibles;
- evitar copiar noticias reales por riesgo de derechos y obsolescencia.

### Leyenda

Uso interno principal: cobertura de habilidades asociadas a módulos 4 y 5.

Características requeridas:

- 600 a 900 palabras;
- tercera persona;
- narrador identificable, preferentemente omnisciente;
- personajes con objetivos claros;
- secuencia de conflicto, desarrollo y desenlace;
- relación con lugar, fenómeno natural o tradición;
- conectores temporales, causales y adversativos;
- pronombres, posesivos y demostrativos abundantes;
- casos útiles para cohesión y referentes;
- palabras con B/V cuando se necesite entrenamiento ortográfico.

Debe permitir preguntas sobre:

- clase textual;
- propósito;
- narrador;
- personajes y motivaciones;
- orden cronológico;
- cohesión y referentes;
- conectores;
- demostrativos y posesivos;
- uso de B/V;
- inferencias de causa y consecuencia.

Recomendación operativa:

- preferir relatos tradicionales en dominio público y redactar una versión propia;
- registrar siempre la tradición de origen y evitar apropiaciones o simplificaciones ofensivas.

### Artículo enciclopédico

Uso interno principal: cobertura de habilidades asociadas a módulo 5.

Características requeridas:

- 600 a 900 palabras;
- tono expositivo objetivo;
- título y subtítulos;
- progresión por subtemas;
- definiciones claras;
- tercera persona y modo indicativo;
- adjetivos descriptivos, no valorativos;
- adverbios de lugar, tiempo, modo, cantidad, afirmación, negación y duda;
- oraciones bimembres analizables;
- ejemplos de sujeto simple/compuesto, predicado simple/compuesto, modificadores, objeto directo y circunstanciales;
- vocabulario con C/S/Z entrenable.

Debe permitir preguntas sobre:

- tema;
- clase textual;
- paratextos;
- comprensión explícita;
- organización por subtemas;
- adverbios;
- sujeto y predicado;
- modificadores;
- complementos del predicado;
- reglas C/S/Z.

Temas recomendados:

- patrimonio natural;
- pueblos y culturas históricas;
- fenómenos geográficos;
- inventos;
- animales;
- sitios históricos;
- procesos científicos simples.

### Cuento o narración integradora

Uso interno principal: cobertura integradora asociada a módulo 6.

Características requeridas:

- 700 a 1000 palabras;
- trama cerrada;
- conflicto claro;
- personajes reconocibles;
- narrador y temporalidad analizables;
- variedad gramatical suficiente;
- texto apto para preguntas de opción múltiple;
- sin dependencia de conocimientos externos.

Debe permitir preguntas mixtas sobre:

- comprensión global;
- inferencias;
- clase textual;
- narrador;
- verbos;
- pronombres;
- clases de palabras;
- acentuación;
- sintaxis;
- cohesión;
- ortografía.

## Umbral de incorporación al proyecto

Un texto puede incorporarse como estímulo lector o TextGroup interno cuando:

1. tiene ficha de candidato completa;
2. tiene decisión legal clara;
3. cubre al menos una clase textual prioritaria;
4. declara `trainable_skills`;
5. permite generar 3 a 8 preguntas;
6. cada pregunta puede mapearse a `skill_id` y `subskill_id`;
7. puede mantenerse visible cuando la práctica lo requiera;
8. no requiere copiar consigna oficial;
9. tiene dificultad compatible con sesiones cortas;
10. fue revisado manualmente antes de entrar al JSON del proyecto.

## Formato recomendado para el primer banco

Para el primer ciclo, conviene crear pocos estímulos bien controlados:

- 2 biografías;
- 2 noticias originales;
- 2 leyendas;
- 2 artículos enciclopédicos;
- 1 cuento integrador.

Cada uno debería tener inicialmente 3 preguntas. Luego se puede ampliar a 5-8 preguntas por texto si las preguntas siguen subordinadas a skills.

## Salida esperada de la búsqueda

La búsqueda no termina con una lista de enlaces. Termina con un inventario curado:

```json
{
  "candidate_id": "bio-001",
  "module_fit": ["modulo_1", "modulo_2"],
  "module_fit_usage": "internal_coverage_only",
  "text_type": "biografia",
  "title": "",
  "source": "",
  "license": "",
  "word_count": 0,
  "difficulty": "inicial",
  "trainable_skills": [],
  "candidate_status": "accepted_for_adaptation",
  "notes": ""
}
```

Ese inventario puede convertirse después en archivos de TextGroup o estímulo lector para el loader, siempre con selección visible por skill.

## Referencias de licencia a verificar

Antes de usar una fuente externa, revisar la página de licencia vigente de esa fuente. Puntos ya detectados:

- Wikisource declara contenido bajo CC BY-SA 4.0 y admite textos en dominio público o licencias compatibles. Es útil, pero exige atribución y compartir igual cuando corresponda.
- Project Gutenberg permite usos amplios para textos no restringidos por copyright en Estados Unidos, pero advierte que fuera de Estados Unidos debe verificarse la ley local y que hay reglas sobre la marca Project Gutenberg.
- Educ.ar publica muchos recursos con Creative Commons Atribución - No Comercial - Compartir Igual. Esa condición no comercial vuelve esos textos problemáticos para un producto vendible, salvo decisión explícita de alcance.
- La presencia de una obra en internet no implica permiso de reutilización. Si no hay licencia clara, descartar o usar solo como inspiración temática para redactar un texto propio.
