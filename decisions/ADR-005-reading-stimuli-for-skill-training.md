# ADR-005 - Lecturas Como Estímulos Para Entrenamiento Por Skills

## Contexto

El producto entrena habilidades, no contenidos. Sin embargo, en Lengua muchas habilidades evaluables dependen de lectura en contexto: comprensión literal, inferencia, secuencia, cohesión, paratextos, puntuación, tildación y análisis gramatical aplicado.

El primer TextGroup (`BIO-001`, biografía de Violeta Parra) mostró una tensión de producto: implementar "lectura + ejercicios" como unidad visible puede acercar la experiencia al modelo de cuadernillo o curso que App Ingreso busca evitar.

## Decisión

Las lecturas se aceptan como estímulos internos de práctica, no como unidades didácticas visibles.

El sistema debe operar con prioridad skill-first:

```text
skill/subskill prioritaria -> estímulo lector compatible -> pregunta derivada -> feedback -> ajuste
```

Los TextGroups funcionan como banco interno de estímulos lectores. Pueden agrupar texto, paratextos, licencia, rasgos lingüísticos y preguntas derivadas, pero no definen la trayectoria del alumno.

`module_fit` queda permitido únicamente como etiqueta interna de cobertura y auditoría. No debe convertirse en navegación, filtro principal o progreso visible para el alumno.

BIO-001 queda aceptado como primer estímulo lector candidato para entrenamiento futuro, sujeto a auditoría por skill. No se acepta como "unidad Violeta Parra" ni como módulo visible.

## Reglas

- Toda pregunta derivada de un texto debe declarar `skill_id` y `subskill`.
- El selector debe priorizar la skill antes que el texto.
- El progreso se registra por skill y subskill, no por lectura completada.
- El alumno no navega por módulos, textos ni TextGroups.
- Un texto puede permanecer visible durante varias preguntas si eso mejora la práctica lectora y reduce carga cognitiva.
- El sistema puede cambiar de estímulo aunque queden preguntas del mismo texto si la adaptatividad lo recomienda.
- Las imágenes y paratextos solo se usan cuando son estímulos evaluables o apoyan la lectura sin desplazar la práctica.

## Prohibiciones

No se permite:

- biblioteca pública de lecturas;
- rutas centradas en `/reading`, `/module` o `/textgroup`;
- pantalla de selección de módulos como flujo principal del alumno;
- progreso por texto leído o completado;
- secuencia tipo tema -> explicación -> lectura -> evaluación;
- feedback largo con función de clase teórica;
- material oficial copiado o adaptado de cerca.

## Consecuencias

- El banco de textos puede crecer sin cambiar el modelo de producto.
- La búsqueda de nuevos textos debe registrar `trainable_skills` como criterio principal.
- Los módulos oficiales o de referencia solo sirven como matriz interna de cobertura.
- La UI futura debe mostrar la skill entrenada como encabezado principal y el texto como estímulo necesario.
- La arquitectura futura puede incorporar TextGroups, pero subordinados al selector adaptativo y al progreso por skills.

## Estado

Aceptado.
