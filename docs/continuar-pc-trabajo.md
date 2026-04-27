# Continuar el proyecto en la PC del trabajo

Guia para retomar el proyecto en otra PC.

## 1. Abrir el proyecto

En PowerShell:

```powershell
cd C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product
```

Si el proyecto esta sincronizado por OneDrive, esperar a que termine de sincronizar antes de instalar o correr comandos. Si se usa Git entre PCs, revisar primero:

```powershell
git status
```

Si hay remoto configurado y la PC del trabajo no tiene los ultimos cambios:

```powershell
git pull
```

## 2. Instalar dependencias

Ejecutar siempre que cambie `package.json` o `package-lock.json`:

```powershell
npm install
```

Esto instala tambien `@playwright/test` y `vitest`, que se usan para validacion E2E y unitaria.

## 3. Instalar Chromium para Playwright

En esa PC puede faltar el navegador que usa Playwright. Instalarlo con:

```powershell
npm run test:e2e:install
```

Ese script equivale a:

```powershell
playwright install chromium
```

Solo hace falta repetirlo si Playwright avisa que falta el browser, si se borro la cache de navegadores, o si se reinstalo el entorno.

## 4. Verificar que el proyecto esta sano

Primero tests unitarios de dominio:

```powershell
npm run test:unit
```

Despues TypeScript. El comando genera primero tipos de rutas de Next:

```powershell
npm run typecheck
```

Despues build de Next:

```powershell
npm run build
```

Despues prueba automatica en Chromium:

```powershell
npm run test:e2e
```

Las pruebas actuales validan, entre otros puntos:

- `Practicas`: cantidad de sesiones de practica registradas para la habilidad.
- `Respuestas`: cantidad real de preguntas respondidas.
- `Precision`: porcentaje calculado con respuestas correctas / respuestas totales.
- Recomendacion de siguiente paso en dashboard.
- URLs publicas con slugs para habilidades/lecturas.
- Compatibilidad con URLs legacy que usan IDs tecnicos.

## 5. Levantar la app

Para trabajar localmente:

```powershell
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Pantallas importantes:

- Practica: `http://localhost:3000/practice`
- Dashboard: `http://localhost:3000/dashboard`

## 6. Que quedo hecho

Ultimos cambios relevantes:

- Homepage, dashboard y simulador usan `buildMasteryModel()` y `getNextStepRecommendation()` como fuente canonica.
- El simulador guarda progreso con `mode: "simulator"` y devuelve recomendacion posterior.
- Las sesiones reading-based cierran con resumen de texto, comprension lectora y glosario.
- Las URLs nuevas usan slugs publicos (`comprension-global-del-texto`, `violeta-parra`) y aceptan IDs tecnicos legacy.
- Skill 3 sumo ejercicios `multiple_choice` compatibles con simulador.
- Se agrego Vitest y tests unitarios para `next_step`.

## 7. Archivos que conviene revisar si algo falla

- `src/app/practice/PracticeQuestion.tsx`: pantalla de practica y final de sesion.
- `src/app/practice/page.tsx`: resolucion de slugs/IDs y apertura de sesiones.
- `src/app/dashboard/page.tsx`: calculo de metricas del dashboard.
- `src/app/page.tsx`: home gamificada y recomendacion principal.
- `src/app/simulaciones/page.tsx`: guardado de simulador y recomendacion posterior.
- `src/recommendation/next_step.ts`: contrato canonico de siguiente paso.
- `src/progress/mastery_model.ts`: interpretacion canonica de progreso.
- `src/skills/skill_slugs.ts`: slugs publicos y compatibilidad con IDs legacy.
- `src/components/dashboard/SkillItem.tsx`: render de `Precision`, `Practicas` y `Respuestas`.
- `playwright.config.ts`: configuracion de Playwright.
- `vitest.config.ts`: configuracion de Vitest.
- `tests/e2e/dashboard-progress.spec.ts`: prueba automatica del dashboard.
- `tests/e2e/lengua-practice-links.spec.ts`: pruebas de links de practica/lectura.
- `src/recommendation/__tests__/next_step.test.ts`: tests unitarios de recomendacion.
- `data/progress.json`: datos locales de progreso.

## 8. Cuidado con data/progress.json

`data/progress.json` guarda progreso local. Al practicar manualmente se modifica. La prueba E2E escribe datos controlados y luego restaura el archivo original al terminar.

Si aparece modificado en `git status`, revisar si el cambio viene de una practica real o de una prueba interrumpida:

```powershell
git diff -- data/progress.json
```

No borrar ni revertir este archivo sin confirmar que no contiene progreso que se quiera conservar.

## 9. Regla del proyecto: graphify

El proyecto tiene grafo en `graphify-out/`.

Antes de preguntas de arquitectura o codigo, revisar:

```powershell
Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 160
```

Despues de modificar archivos de codigo, actualizar el grafo:

```powershell
graphify update .
```

Si `graphify` no esta instalado en la PC del trabajo, no bloquea correr la app ni los tests, pero conviene instalarlo o volver a ejecutar el update desde la PC donde si este disponible.

## 10. Comando rapido de arranque

Para retomar rapido en la PC del trabajo:

```powershell
cd C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product
npm install
npm run test:e2e:install
npm run test:unit
npm run typecheck
npm run build
npm run test:e2e
npm run dev
```
