# 02 - Validacion del sistema de agentes

> Validacion Codex contra codigo real. Fuente MiMo: `docs/analysis/03_agent_system_evaluation.md`.

## Veredicto ejecutivo

El diagnostico de MiMo es correcto: los agentes son documentales, no operativos. No hay TypeScript, scripts, npm tasks, hooks ni integracion runtime que ejecute Product Guardian, Scope & Rules Validator, Quality Auditor o Codex Prompt Generator.

## Evidencia documental

Existen archivos completos de especificacion:

- Definiciones: `agents/definitions/agent_01_product_guardian.md`, `agent_02_scope_rules_validator.md`, `agent_03_quality_auditor.md`, `agent_04_codex_prompt_generator.md`.
- Orquestacion y prompts: `agents/orchestrator.md`, `agents/orchestrator_prompt.md`.
- Protocolos: `agents/protocols/interaction_flow.md`, `agents/protocols/validation_pipeline.md`.
- Ejemplos: `agents/examples/ejemplo_01_ajuste_menor.md`, `ejemplo_02_idea_nueva.md`, `ejemplo_03_bloqueado_p0.md`.

Los documentos usan lenguaje operacional ("siempre se ejecuta", "activa", "bloquea"), pero ese comportamiento existe solo como texto.

## Evidencia de no ejecucion runtime

Confirmado:

- `src/` no contiene carpeta `agents`, clases de agente, pipeline ejecutable ni imports hacia `agents/`.
- `package.json` solo define `dev`, `build`, `start`, `test:e2e`, `test:e2e:headed`, `test:e2e:install`, `typecheck`; no hay `validate-change`, `agents`, `precommit` ni `prepare`.
- No existe carpeta `scripts/`.
- La busqueda de referencias ejecutables a los agentes fuera de `agents/` devuelve solo metadata documental en JSON de ejercicios:
  - `docs/04_exercise_engine/lengua_exercises_modulo3.json:4-5` declara `generated_by` y `validated_by`.
  - `docs/04_exercise_engine/lengua_exercises_v1.json:3` declara `validated_by`.

Interpretacion: esas marcas son trazabilidad textual, no prueba de ejecucion.

## Hooks, pipelines o integracion real

No encontrados:

- No hay pre-commit hook versionado.
- No hay Husky ni equivalente en `package.json`.
- No hay GitHub Actions en el arbol visible.
- No hay endpoint API para ejecutar agentes.
- No hay server action, middleware ni componente que consulte `agents/`.
- No hay AST parser, rule engine ni contrato JSON para salidas de agentes.

## Respuesta directa

### Son 100% documentales?

Si, en el estado actual del codigo de aplicacion. El unico "rastro operativo" es que algunos archivos de contenido dicen haber sido generados o validados por agentes, pero no hay mecanismo que lo haya ejecutado dentro del repo.

### Hay algun rastro de ejecucion real?

No hay rastro de ejecucion programatica. Hay trazas de uso humano/asistido por LLM en metadata y documentos. Eso permite inferir que los agentes fueron usados como protocolo de trabajo, pero no como sistema operativo.

## Contradicciones detectadas en MiMo

No hay contradicciones sustanciales. El analisis de MiMo es correcto.

Matiz: "0 lineas de codigo agentico" es correcto si se entiende como codigo de agentes. Hay referencias textuales en datos y docs, pero no constituyen runtime.

## Decision implementable

El primer agente operativo debe ser un CLI de desarrollo, no una feature de usuario final:

- Crear `src/agents/product_guardian.ts` con heuristicas deterministicas.
- Crear `src/agents/pipeline.ts` para encadenar validadores.
- Crear `scripts/validate-change.ts`.
- Agregar `npm run validate-change -- "descripcion del cambio"`.

No conviene integrar pre-commit hasta que el CLI tenga baja tasa de falsos positivos.
