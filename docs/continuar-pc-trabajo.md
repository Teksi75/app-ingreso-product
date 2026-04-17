# Continuar el proyecto en la PC del trabajo

Guia para retomar el proyecto en la otra PC, donde ya se venia trabajando hasta las 16.

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

Esto instala tambien `@playwright/test`, que quedo agregado como dependencia de desarrollo para testing automatico.

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

Primero TypeScript:

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

La prueba actual valida que el dashboard muestre datos utiles:

- `Practicas`: cantidad de sesiones de practica registradas para la habilidad.
- `Respuestas`: cantidad real de preguntas respondidas.
- `Precision`: porcentaje calculado con respuestas correctas / respuestas totales.

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

- Despues de completar las 10 preguntas, la pantalla final muestra un boton `Ver avance y progreso`.
- Ese boton lleva al dashboard.
- El dashboard ya no usa una columna ambigua de `Intentos`.
- Ahora muestra `Practicas` y `Respuestas`.
- Se agrego Playwright para pruebas automaticas con Chromium.
- Se agrego una prueba E2E en `tests/e2e/dashboard-progress.spec.ts`.
- Se agrego configuracion en `playwright.config.ts`.

## 7. Archivos que conviene revisar si algo falla

- `src/app/practice/PracticeQuestion.tsx`: pantalla de practica y final de sesion.
- `src/app/dashboard/page.tsx`: calculo de metricas del dashboard.
- `src/components/dashboard/SkillItem.tsx`: render de `Precision`, `Practicas` y `Respuestas`.
- `playwright.config.ts`: configuracion de Playwright.
- `tests/e2e/dashboard-progress.spec.ts`: prueba automatica del dashboard.
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
npm run typecheck
npm run test:e2e
npm run dev
```

