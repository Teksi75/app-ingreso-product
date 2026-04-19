# Modelo Pedagógico - App Ingreso

## Estado

Aceptado como marco operativo para el entrenamiento de Lengua.

---

## Principio central

App Ingreso no organiza la experiencia como curso, cuadernillo, biblioteca de textos ni recorrido por módulos.

La unidad pedagógica del producto es:

```text
skill_id + subskill + intento evaluable
```

El usuario practica habilidades. El sistema selecciona ejercicios, estímulos y dificultad para entrenar esas habilidades con feedback inmediato.

---

## Lectura como estímulo

En Lengua, muchas habilidades solo pueden entrenarse con lectura real:

- localizar información explícita;
- inferir causas, consecuencias y motivaciones;
- sintetizar una idea global;
- reconocer secuencia, cohesión y progresión;
- analizar categorías gramaticales en contexto;
- aplicar puntuación, tildación y norma ortográfica con sentido.

Por eso los textos son insumos ineludibles. Pero su rol es instrumental:

```text
skill prioritaria -> estímulo lector compatible -> pregunta evaluable -> feedback -> siguiente selección
```

Un texto no se incorpora porque sea un tema para aprender. Se incorpora si puede funcionar como estímulo para entrenar habilidades transferibles.

---

## Lo que el texto puede hacer

Un texto puede:

- aportar contexto para una o varias preguntas;
- mantenerse visible durante una secuencia breve si reduce carga cognitiva;
- ofrecer paratextos, estructura y rasgos lingüísticos evaluables;
- reutilizarse en distintos ejercicios cuando entrena skills distintas;
- registrar cobertura interna de examen mediante etiquetas como `module_fit`;
- ayudar a variar el contenido para evitar memorización mecánica.

El valor pedagógico no se mide por "haber leído el texto", sino por la respuesta observable a ejercicios mapeados a skills.

---

## Lo que el texto no puede hacer

El producto no debe convertir textos en la estructura principal de navegación.

Queda prohibido:

- biblioteca visible de lecturas;
- navegación por módulos como experiencia del alumno;
- rutas públicas centradas en textos o módulos;
- progreso por "texto completado";
- secuencias tipo tema -> explicación -> lectura -> evaluación;
- teoría previa larga antes de practicar;
- presentar un texto como unidad didáctica autónoma;
- medir memorización de contenido como si fuera dominio de skill.

Los módulos de Lengua son matriz de cobertura interna. No son trayectoria visible del alumno.

---

## Diseño de ejercicios

Cada ejercicio debe declarar:

- `skill_id`;
- `subskill`;
- dificultad;
- tipo de ejercicio;
- estímulo o fragmento usado, si corresponde;
- respuesta verificable;
- feedback correcto e incorrecto breve.

Si un ejercicio deriva de un texto largo, el texto se trata como estímulo lector o `TextGroup` interno. La pregunta sigue perteneciendo a la skill, no al texto.

El selector debe priorizar:

1. skill o subskill que necesita práctica;
2. dificultad adecuada;
3. estímulo lector compatible;
4. variación suficiente para evitar repetición inmediata.

---

## Feedback

El feedback debe ser:

- inmediato;
- breve;
- accionable;
- vinculado al error de skill;
- sin explicación teórica extensa.

Ejemplo válido:

```text
Revisa el conector temporal: la fecha de 1964 ocurre después del viaje a Europa.
```

Ejemplo no válido:

```text
Clase completa sobre conectores temporales con definición, tipos, ejemplos y práctica guiada.
```

---

## Carga cognitiva

Los textos largos solo son válidos si la interfaz y la sesión sostienen práctica de baja fricción.

Reglas:

- usar texto completo cuando la skill exige comprensión global;
- usar fragmentos cuando la skill puede entrenarse localmente;
- evitar más preguntas de las necesarias sobre el mismo estímulo;
- no obligar a completar todo un textgroup para avanzar;
- cambiar de estímulo si la repetición favorece memorización de respuestas.

---

## Relación con módulos de Lengua

Los módulos de Lengua sirven para:

- identificar clases textuales esperadas;
- detectar rasgos lingüísticos a cubrir;
- construir sustitutos legales y originales;
- auditar cobertura contra habilidades probables del examen.

No sirven para:

- ordenar la experiencia del alumno;
- nombrar sesiones visibles;
- prometer equivalencia con material oficial;
- reproducir consignas, textos o estructura del cuadernillo.

---

## Búsqueda de nuevos textos

La búsqueda de biografías, noticias, leyendas, artículos enciclopédicos y cuentos integradores debe obedecer al modelo skill-first.

Cada candidato debe declarar:

- tipo textual;
- longitud objetivo;
- fuente y licencia;
- rasgos lingüísticos útiles;
- paratextos disponibles;
- `trainable_skills`;
- riesgos de sensibilidad;
- decisión de aceptar, adaptar o descartar.

`trainable_skills` pesa más que `module_fit`. Un texto con buena cobertura de módulo pero sin skills evaluables no entra al banco.

---

## Criterios de aceptación

Un cambio relacionado con lectura es válido si:

- conserva el entrenamiento por skills como organizador principal;
- no introduce navegación visible por textos o módulos;
- no mide progreso por lectura completada;
- cada pregunta derivada de texto tiene skill/subskill explícita;
- el feedback sigue siendo breve y operativo;
- el texto es original, de dominio público o tiene licencia compatible;
- no reproduce material oficial ni adaptaciones cercanas.

Si una propuesta de lectura no cumple estos criterios, debe bloquearse antes de implementación.
