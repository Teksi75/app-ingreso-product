# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: all-pages.spec.ts >> capture all pages
- Location: tests\e2e\all-pages.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/perfil", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e6]:
      - heading "Mi Perfil" [level=1] [ref=e7]
      - generic [ref=e8]: 👤
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e14]:
            - generic [ref=e15]:
              - generic [ref=e19]: 🎓
              - generic [ref=e21]: Nivel 7
            - generic [ref=e24]: Estudiante Dedicada
            - generic [ref=e26]:
              - generic [ref=e27]: Energía
              - generic [ref=e28]: 85%
          - generic [ref=e31]:
            - paragraph [ref=e32]: Cambiar Avatar
            - generic [ref=e33]:
              - button "🎓" [ref=e34]
              - button "👩‍🎓" [ref=e35]
              - button "👨‍🎓" [ref=e36]
              - button "🧑‍🔬" [ref=e37]
              - button "👩‍🔬" [ref=e38]
              - button "🦸" [ref=e39]
              - button "🦹" [ref=e40]
              - button "🧙" [ref=e41]
              - button "🧝" [ref=e42]
              - button "🧛" [ref=e43]
        - generic [ref=e44]:
          - heading "Estadísticas" [level=3] [ref=e45]
          - generic [ref=e46]:
            - generic [ref=e47]:
              - generic [ref=e48]: Miembro desde
              - generic [ref=e49]: Enero 2026
            - generic [ref=e50]:
              - generic [ref=e51]: Días activa
              - generic [ref=e52]: 45 días
            - generic [ref=e53]:
              - generic [ref=e54]: Ejercicios totales
              - generic [ref=e55]: "359"
            - generic [ref=e56]:
              - generic [ref=e57]: Logros
              - generic [ref=e58]: 3 de 12
      - generic [ref=e59]:
        - generic [ref=e60]:
          - heading "Información Personal" [level=3] [ref=e61]
          - generic [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]: Nombre
              - textbox [ref=e65]: Sofía
            - generic [ref=e66]:
              - generic [ref=e67]: Email
              - textbox [ref=e68]: sofia@ejemplo.com
            - generic [ref=e69]:
              - generic [ref=e70]: Edad
              - textbox [ref=e71]: 12 años
            - generic [ref=e72]:
              - generic [ref=e73]: Escuela
              - textbox [ref=e74]: "Escuela Primaria #42"
        - generic [ref=e75]:
          - heading "Configuración" [level=3] [ref=e76]
          - generic [ref=e77]:
            - generic [ref=e78]:
              - generic [ref=e79]:
                - paragraph [ref=e80]: Notificaciones
                - paragraph [ref=e81]: Recibir recordatorios diarios
              - button [ref=e82]
            - generic [ref=e84]:
              - generic [ref=e85]:
                - paragraph [ref=e86]: Sonidos
                - paragraph [ref=e87]: Efectos de sonido en la app
              - button [ref=e88]
            - generic [ref=e90]:
              - generic [ref=e91]:
                - paragraph [ref=e92]: Modo Oscuro
                - paragraph [ref=e93]: Cambiar apariencia
              - button [ref=e94]
            - generic [ref=e96]:
              - generic [ref=e97]:
                - paragraph [ref=e98]: Reportes a Padres
                - paragraph [ref=e99]: Enviar reportes semanales automáticamente
              - button [ref=e100]
        - generic [ref=e102]:
          - heading "Acceso para Padres" [level=3] [ref=e103]
          - paragraph [ref=e104]: Comparte el código con tus padres para que puedan ver tu progreso.
          - generic [ref=e105]:
            - generic [ref=e106]: ING-7842-SOF
            - button "Copiar" [ref=e107]
        - generic [ref=e108]:
          - heading "Zona de Peligro" [level=3] [ref=e109]
          - paragraph [ref=e110]: Estas acciones no se pueden deshacer.
          - generic [ref=e111]:
            - button "Borrar Progreso" [ref=e112]
            - button "Eliminar Cuenta" [ref=e113]
  - navigation [ref=e114]:
    - generic [ref=e115]:
      - link "Inicio" [ref=e116] [cursor=pointer]:
        - /url: /
        - img [ref=e118]
        - generic [ref=e120]: Inicio
      - link "Habilidades" [ref=e121] [cursor=pointer]:
        - /url: /habilidades
        - img [ref=e123]
        - generic [ref=e125]: Habilidades
      - link "Simulaciones" [ref=e126] [cursor=pointer]:
        - /url: /simulaciones
        - img [ref=e128]
        - generic [ref=e130]: Simulaciones
      - link "Progreso" [ref=e131] [cursor=pointer]:
        - /url: /progreso
        - img [ref=e133]
        - generic [ref=e135]: Progreso
      - link "Perfil" [ref=e136] [cursor=pointer]:
        - /url: /perfil
        - img [ref=e138]
        - generic [ref=e141]: Perfil
```

# Test source

```ts
  1  | import { test } from "@playwright/test";
  2  | 
  3  | test("capture all pages", async ({ page }) => {
  4  |   const pages = [
  5  |     { url: "http://localhost:3000/", name: "dashboard" },
  6  |     { url: "http://localhost:3000/habilidades", name: "habilidades" },
  7  |     { url: "http://localhost:3000/simulaciones", name: "simulaciones" },
  8  |     { url: "http://localhost:3000/progreso", name: "progreso" },
  9  |     { url: "http://localhost:3000/perfil", name: "perfil" },
  10 |   ];
  11 | 
  12 |   for (const { url, name } of pages) {
> 13 |     await page.goto(url);
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  14 |     await page.waitForLoadState("networkidle");
  15 |     await page.waitForTimeout(500);
  16 | 
  17 |     // Desktop
  18 |     await page.setViewportSize({ width: 1440, height: 900 });
  19 |     await page.waitForTimeout(300);
  20 |     await page.screenshot({
  21 |       path: `.screenshots/screenshot-${name}-desktop.png`,
  22 |       fullPage: true,
  23 |     });
  24 | 
  25 |     // Mobile
  26 |     await page.setViewportSize({ width: 375, height: 812 });
  27 |     await page.waitForTimeout(300);
  28 |     await page.screenshot({
  29 |       path: `.screenshots/screenshot-${name}-mobile.png`,
  30 |       fullPage: true,
  31 |     });
  32 | 
  33 |     console.log(`Screenshots captured for ${name}`);
  34 |   }
  35 | });
  36 | 
```