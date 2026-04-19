# Busqueda de textos candidatos para TextGroup

## Objetivo

Definir como buscar, evaluar e incorporar textos principales alternativos a los propuestos por los modulos oficiales, para avanzar hacia el modelo de lectura con un texto compartido y multiples preguntas asociadas.

Este documento toma como insumo los informes generados en:

`C:\Users\pablo\OneDrive\Desarrollo\content-analysis-system\analysis\outputs`

La busqueda no debe reproducir textos oficiales ni consignas oficiales. El objetivo es construir un banco propio de textos equivalentes en funcion pedagogica, no equivalentes por copia.

## Principio rector

Cada texto candidato debe funcionar como unidad de entrenamiento reutilizable:

- un texto base visible durante toda la actividad;
- al menos 3 preguntas asociadas;
- cobertura de comprension lectora y reflexion sobre la lengua;
- metadatos suficientes para justificar clase textual, fuente, tema, dificultad y habilidades entrenadas.

El texto no se acepta porque "se parece" al modulo oficial. Se acepta si permite entrenar las mismas habilidades transferibles con contenido original o reutilizable legalmente.

## Restricciones de contenido

No se deben incorporar:

- textos oficiales de examenes, cuadernillos institucionales o materiales de ingreso;
- adaptaciones demasiado cercanas a textos oficiales;
- noticias, articulos o fragmentos con licencia dudosa;
- textos con licencia que prohiba obras derivadas;
- textos con licencia no comercial si el producto se proyecta como comercial, salvo decision explicita posterior;
- textos que requieran imagen, mapa o grafico para ser entendidos si la primera version de TextGroup sera solo texto;
- textos con carga ideologica, religiosa, partidaria o sensible que distraiga del objetivo linguistico;
- textos demasiado largos para sostener una sesion corta.

## Fuentes candidatas

Prioridad alta:

1. Textos originales redactados internamente a partir de una ficha pedagogica.
2. Textos en dominio publico verificable.
3. Textos con licencia CC BY o CC BY-SA, si se conserva atribucion y licencia.
4. Relatos tradicionales reescritos internamente desde fuentes multiples, sin copiar una version moderna protegida.

Prioridad media:

1. Fuentes gubernamentales o educativas con licencia clara y compatible.
2. Articulos enciclopedicos abiertos que permitan adaptacion.
3. Biografias de personajes historicos fallecidos hace suficiente tiempo, siempre que el texto usado sea propio o de fuente libre.

Prioridad baja:

1. Sitios periodisticos actuales.
2. Blogs personales.
3. Materiales didacticos comerciales.
4. Textos sin pagina de licencia o sin autor/fuente identificable.

## Flujo de busqueda

### 1. Extraer la necesidad desde los informes

Para cada modulo, registrar:

- clase textual trabajada;
- longitud aproximada del texto oficial;
- habilidades asociadas;
- paratextos necesarios;
- rasgos linguisticos que deben aparecer;
- cantidad minima de preguntas que puede sostener.

Los informes actuales muestran este mapa:

| Modulo | Clase textual principal | Funcion esperada |
|---|---|---|
| 1 | Biografia | Paratexto, clase textual, parrafo, sustantivos, adjetivos, mayusculas, coma |
| 2 | Biografia reutilizada | Cotexto, sinonimos, antonimos, verbos, pronombres, acentuacion, narracion |
| 3 | Noticia periodistica | Paratextos periodisticos, comprension, diptongo/triptongo/hiato, modos y tiempos verbales |
| 4 | Leyenda | Narrador, cohesion, coherencia, conectores, posesivos, demostrativos, uso de B/V |
| 5 | Articulo enciclopedico + leyenda | Comprension expositiva, adverbios, sintaxis, sujeto/predicado, complementos, uso de C/S/Z |
| 6 | Cuento/narracion integradora | Integracion de comprension, clases textuales, gramatica, sintaxis y ortografia |

### 2. Redactar una ficha de busqueda

Antes de buscar, crear una ficha breve:

```text
Modulo objetivo:
Clase textual:
Tema deseado:
Longitud:
Habilidades que debe cubrir:
Paratextos requeridos:
Rasgos gramaticales necesarios:
Restricciones legales:
Nivel de dificultad:
Cantidad esperada de preguntas:
```

### 3. Buscar por funcion, no por titulo

Las consultas deben combinar clase textual, tema, licencia y rasgos utiles:

- `biografia cientifica dominio publico ninos`
- `biografia escritora argentina licencia creative commons`
- `leyenda argentina dominio publico texto`
- `relato tradicional mendocino dominio publico`
- `articulo enciclopedico incas licencia creative commons`
- `noticia cultural licencia creative commons`
- `texto expositivo patrimonio natural argentina licencia abierta`

Para noticias, la opcion preferente es no copiar una noticia real. Conviene crear una noticia original basada en un hecho cultural o comunitario no sensible, con estructura periodistica completa: volanta, titulo, copete, fuente simulada interna, fecha, cuerpo y autor institucional propio.

### 4. Registrar candidatos

Cada texto encontrado o propuesto debe quedar registrado antes de adaptarse:

```text
ID candidato:
Titulo:
Clase textual:
Tema:
Fuente URL o fuente interna:
Autor:
Licencia:
Permite adaptacion: si/no
Permite uso comercial: si/no/no definido
Palabras aproximadas:
Parrafos:
Paratextos disponibles:
Habilidades entrenables:
Riesgos:
Decision: aceptar / adaptar / descartar
Motivo:
```

### 5. Evaluar con rubrica

Un texto pasa a banco candidato si cumple todos los criterios obligatorios y al menos 4 criterios pedagogicos.

Criterios obligatorios:

- licencia clara o autoria interna;
- no reproduce material oficial;
- permite crear preguntas derivadas;
- tiene una clase textual identificable;
- puede sostener minimo 3 preguntas;
- es comprensible sin imagen obligatoria;
- no contiene informacion riesgosa para menores.

Criterios pedagogicos:

- tiene vocabulario con palabras inferibles por cotexto;
- incluye suficientes sustantivos, adjetivos, verbos y pronombres analizables;
- esta organizado en parrafos claros;
- permite preguntas literales e inferenciales;
- contiene conectores reconocibles;
- tiene marcas temporales o causales;
- incluye paratextos relevantes;
- se puede adaptar a 350-900 palabras sin perder sentido;
- admite dificultad graduable.

## Criterios especificos por tipo textual

### Biografia

Uso principal: modulos 1 y 2.

Caracteristicas requeridas:

- 600 a 850 palabras para texto principal; 350 a 550 si es version inicial corta;
- tercera persona;
- orden cronologico dominante;
- fechas, lugares, nombres propios y hechos verificables;
- parrafos que desarrollen etapas de vida;
- fuente o nota de procedencia;
- vocabulario con adjetivos calificativos y gentilicios;
- variedad de sustantivos propios, comunes, concretos y abstractos;
- verbos en pasado y algunos conectores temporales.

Debe permitir preguntas sobre:

- proposito de la biografia;
- tema central;
- orden de acontecimientos;
- paratextos;
- cantidad o funcion de parrafos;
- significado por cotexto;
- sinonimos y antonimos;
- pronombres;
- acentuacion;
- sustantivos, adjetivos y uso de mayusculas.

Temas recomendados:

- escritores, cientificas, artistas, deportistas o exploradores de relevancia cultural;
- figuras con vida documentada y baja controversia;
- personajes que permitan conectar logros con perseverancia, creatividad o aporte social.

### Noticia periodistica

Uso principal: modulo 3.

Caracteristicas requeridas:

- 350 a 600 palabras;
- estructura con volanta o seccion, titulo, copete, fecha, fuente/autor y cuerpo;
- acontecimiento claro y cerrado;
- tema cultural, cientifico, ambiental o comunitario;
- datos que respondan que, quien, cuando, donde, como y por que;
- verbos en pasado para hechos ocurridos y futuro/condicional si hay proyeccion;
- palabras con diptongo, hiato y, si es posible, triptongo;
- vocabulario que permita inferencia por cotexto.

Debe permitir preguntas sobre:

- clase textual;
- paratextos periodisticos;
- fuente;
- tema y proposito;
- informacion explicita;
- diptongo, triptongo e hiato;
- modo y tiempo verbal;
- reconstruccion de datos de la noticia.

Recomendacion operativa:

- producir noticias originales internas a partir de eventos ficticios verosimiles o hechos publicos no sensibles;
- evitar copiar noticias reales por riesgo de derechos y obsolescencia.

### Leyenda

Uso principal: modulo 4 y apoyo del modulo 5.

Caracteristicas requeridas:

- 600 a 900 palabras;
- tercera persona;
- narrador identificable, preferentemente omnisciente;
- personajes con objetivos claros;
- secuencia de conflicto, desarrollo y desenlace;
- relacion con lugar, fenomeno natural o tradicion;
- conectores temporales, causales y adversativos;
- pronombres, posesivos y demostrativos abundantes;
- casos utiles para cohesion y referentes;
- palabras con B/V cuando se necesite entrenamiento ortografico.

Debe permitir preguntas sobre:

- clase textual;
- proposito;
- narrador;
- personajes y motivaciones;
- orden cronologico;
- cohesion y referentes;
- conectores;
- demostrativos y posesivos;
- uso de B/V;
- inferencias de causa y consecuencia.

Recomendacion operativa:

- preferir relatos tradicionales en dominio publico y redactar una version propia;
- registrar siempre la tradicion de origen y evitar apropiaciones o simplificaciones ofensivas.

### Articulo enciclopedico

Uso principal: modulo 5.

Caracteristicas requeridas:

- 600 a 900 palabras;
- tono expositivo objetivo;
- titulo y subtitulos;
- progresion por subtemas;
- definiciones claras;
- tercera persona y modo indicativo;
- adjetivos descriptivos, no valorativos;
- adverbios de lugar, tiempo, modo, cantidad, afirmacion, negacion y duda;
- oraciones bimembres analizables;
- ejemplos de sujeto simple/compuesto, predicado simple/compuesto, modificadores, objeto directo y circunstanciales;
- vocabulario con C/S/Z entrenable.

Debe permitir preguntas sobre:

- tema;
- clase textual;
- paratextos;
- comprension explicita;
- organizacion por subtemas;
- adverbios;
- sujeto y predicado;
- modificadores;
- complementos del predicado;
- reglas C/S/Z.

Temas recomendados:

- patrimonio natural;
- pueblos y culturas historicas;
- fenomenos geograficos;
- inventos;
- animales;
- sitios historicos;
- procesos cientificos simples.

### Cuento o narracion integradora

Uso principal: modulo 6.

Caracteristicas requeridas:

- 700 a 1000 palabras;
- trama cerrada;
- conflicto claro;
- personajes reconocibles;
- narrador y temporalidad analizables;
- variedad gramatical suficiente;
- texto apto para preguntas de opcion multiple;
- sin dependencia de conocimientos externos.

Debe permitir preguntas mixtas sobre:

- comprension global;
- inferencias;
- clase textual;
- narrador;
- verbos;
- pronombres;
- clases de palabras;
- acentuacion;
- sintaxis;
- cohesion;
- ortografia.

## Umbral de incorporacion al proyecto

Un texto puede incorporarse como `TextGroup` cuando:

1. tiene ficha de candidato completa;
2. tiene decision legal clara;
3. cubre al menos una clase textual prioritaria;
4. permite generar 3 a 8 preguntas;
5. cada pregunta puede mapearse a `skill_id` y `subskill_id`;
6. el texto puede mantenerse visible durante toda la secuencia;
7. no requiere copiar consigna oficial;
8. tiene dificultad compatible con sesiones cortas;
9. fue revisado manualmente antes de entrar al JSON del proyecto.

## Formato recomendado para el primer banco

Para el primer ciclo de implementacion, conviene crear pocos textos pero bien controlados:

- 2 biografias;
- 2 noticias originales;
- 2 leyendas;
- 2 articulos enciclopedicos;
- 1 cuento integrador.

Cada uno deberia tener inicialmente 3 preguntas. Luego se puede ampliar a 5-8 preguntas por texto.

## Salida esperada de la busqueda

La busqueda no termina con una lista de enlaces. Termina con un inventario curado:

```json
{
  "candidate_id": "bio-001",
  "module_fit": ["modulo_1", "modulo_2"],
  "text_type": "biografia",
  "title": "",
  "source": "",
  "license": "",
  "word_count": 0,
  "difficulty": "inicial",
  "target_skills": [],
  "candidate_status": "accepted_for_adaptation",
  "notes": ""
}
```

Ese inventario puede convertirse despues en archivos `text_groups` para el loader.

## Referencias de licencia a verificar

Antes de usar una fuente externa, revisar la pagina de licencia vigente de esa fuente. Puntos ya detectados:

- Wikisource declara contenido bajo CC BY-SA 4.0 y admite textos en dominio publico o licencias compatibles. Es util, pero exige atribucion y compartir igual cuando corresponda.
- Project Gutenberg permite usos amplios para textos no restringidos por copyright en Estados Unidos, pero advierte que fuera de Estados Unidos debe verificarse la ley local y que hay reglas sobre la marca Project Gutenberg.
- Educ.ar publica muchos recursos con Creative Commons Atribucion - No Comercial - Compartir Igual. Esa condicion no comercial vuelve esos textos problematicos para un producto vendible, salvo decision explicita de alcance.
- La presencia de una obra en internet no implica permiso de reutilizacion. Si no hay licencia clara, descartar o usar solo como inspiracion tematica para redactar un texto propio.

