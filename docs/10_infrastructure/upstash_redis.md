# Upstash Redis KV en Vercel

## 1. Estado actual (implementación)

Upstash Redis fue creado mediante la integracion automatica disponible desde Vercel. No hubo registro manual previo en Upstash ni creacion directa de la base desde la consola de Upstash.

La base queda asociada operativamente a la cuenta de Vercel del proyecto y al flujo de integraciones de Vercel. Esto significa que el acceso primario, la instalacion de la integracion y la inyeccion de variables de entorno dependen del usuario y del equipo que administran el proyecto en Vercel.

- Nombre de la DB: `upstash-kv-amethyst-prism`
- Tipo: KV (Redis serverless)
- Uso actual en la app: persistencia de progreso por codigo anonimo de estudiante.

La aplicacion guarda sesiones completadas, resultados por habilidad, historial de progreso, habilidades vistas y datos derivados de dominio. El modelo actual no guarda cuentas, passwords, emails, nombres reales, datos de INGENIUM ni datos de licencia comercial.

El contrato de almacenamiento vigente es:

```txt
progress:<codigo_estudiante> -> progreso acumulado del estudiante anonimo
```

La decision de producto asociada es que el progreso pertenece a un estudiante anonimo identificado por codigo, mientras que cualquier licencia comercial futura debe vivir en una capa separada.

## 2. Flujo real de creación (importante)

El flujo real de creacion fue:

```txt
Usuario -> Vercel -> integracion Upstash -> creacion automatica de DB
```

Desde el punto de vista operativo, Vercel actua como intermediario entre el proyecto y Upstash. Al instalar la integracion, Upstash crea o vincula automaticamente una cuenta y provisiona la base Redis/KV necesaria para el proyecto.

El acceso posterior a la DB depende del login usado en Vercel y del proveedor de autenticacion asociado a esa integracion. Por eso, para administrar la base fuera de Vercel, se debe identificar con precision que cuenta o provider quedo vinculado a Upstash durante la instalacion automatica.

Esta forma de creacion es valida para una solucion inicial porque reduce friccion y configura rapidamente las variables necesarias. El costo es que el ownership explicito de la cuenta Upstash queda menos visible que en una cuenta creada manualmente para el proyecto.

## 3. Variables de entorno utilizadas

La app usa estas variables de entorno para conectarse a Upstash Redis:

```txt
KV_REST_API_URL
KV_REST_API_TOKEN
```

Estas variables se configuran en Vercel, dentro del proyecto `app-ingreso-product`, en los entornos donde la app necesite persistencia real. Para produccion son criticas: sin ellas, la app no tiene almacenamiento durable para el progreso.

El consumo en la app ocurre en `src/storage/local_progress_store.ts`. El store crea un cliente `@upstash/redis` leyendo:

```txt
KV_REST_API_URL
KV_REST_API_TOKEN
```

El codigo tambien acepta nombres alternativos compatibles:

```txt
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Pero la configuracion principal esperada para este proyecto es `KV_REST_API_URL` y `KV_REST_API_TOKEN`, porque provienen de la integracion KV/Upstash de Vercel.

Si las variables existen, las operaciones asincronicas de progreso leen y escriben en Redis. Si faltan, el codigo actual cae a almacenamiento local por archivo o memoria, lo cual no es adecuado como persistencia de produccion.

## 4. Riesgos actuales

- Falta de control explicito sobre la cuenta Upstash: la base fue creada por integracion automatica y no por una cuenta documentada del proyecto.
- Dependencia de Vercel como intermediario: la administracion inicial de credenciales y conexion depende del estado de la integracion en Vercel.
- Posible perdida de acceso si no se identifica la cuenta: si el login/provider usado para instalar la integracion no esta claro, puede ser dificil administrar, rotar o migrar la DB desde la consola de Upstash.
- Falta de backups explicitos: no hay estrategia documentada de exportacion, backup ni restauracion del progreso.
- Acoplamiento implicito a proveedor: el codigo actual conoce Upstash Redis como backend de persistencia y no hay una abstraccion formal para cambiar a otro proveedor sin revisar el store.

## 5. Acceso y verificación

La consola de Upstash esta disponible en:

```txt
https://console.upstash.com
```

Para verificar la base, se debe ingresar con el mismo provider o cuenta que quedo vinculado durante la integracion desde Vercel. Si el login no muestra la DB, revisar que se este usando el mismo usuario, equipo o proveedor de autenticacion utilizado al instalar la integracion.

La verificacion minima esperada es:

1. Entrar en `https://console.upstash.com`.
2. Confirmar que aparece la DB `upstash-kv-amethyst-prism`.
3. Confirmar que el tipo de servicio es Redis/KV serverless.
4. Confirmar que existen credenciales REST compatibles con `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
5. Confirmar en Vercel que esas variables estan configuradas en el entorno de produccion.

Si la DB existe en Upstash pero Vercel no tiene las variables, la app desplegada no puede usarla. Si Vercel tiene variables pero la cuenta Upstash no esta identificada, la app puede funcionar, pero el ownership operativo queda incompleto.

## 6. Estrategia futura (MUY IMPORTANTE)

### 6.1 Ownership

Antes de escalar usuarios, se debe migrar la administracion a una cuenta Upstash explicita del proyecto. La DB no debe depender indefinidamente de una creacion automatica cuyo owner real no este documentado.

Lineamientos:

- Definir una cuenta Upstash del proyecto o de la organizacion responsable.
- Documentar owner, metodo de login y responsables de acceso.
- Confirmar que la DB productiva esta bajo esa cuenta.
- Evitar que credenciales criticas dependan de una cuenta personal no documentada.

### 6.2 Infraestructura

Se deben separar entornos para evitar mezclar datos de prueba con datos reales:

- `dev`: desarrollo local y pruebas manuales.
- `staging`: validacion previa a produccion.
- `production`: datos reales de alumnos anonimos.

Cada entorno debe tener variables propias y, preferentemente, una DB o prefijo de claves separado. El prefijo actual por defecto es `progress`, configurable con `PROGRESS_REDIS_KEY`. Si se comparte una misma DB entre entornos, el prefijo debe diferenciarse de forma obligatoria.

### 6.3 Seguridad

Las credenciales de Redis deben gestionarse como secretos de infraestructura.

Lineamientos:

- Rotar tokens cuando cambie el equipo con acceso.
- Rotar tokens si se sospecha exposicion accidental.
- No commitear valores de `KV_REST_API_URL` ni `KV_REST_API_TOKEN`.
- Mantener variables solo en Vercel o en gestores de secretos autorizados.
- Revisar periodicamente quien tiene acceso a Vercel y Upstash.

### 6.4 Escalabilidad

La solucion actual con Upstash Redis es adecuada para el MVP y para validar persistencia de progreso anonimo con baja friccion operativa.

Antes de escalar, se debe evaluar:

- Upstash (mantener): conveniente si el volumen sigue siendo moderado y el modelo principal es progreso actual por estudiante.
- Redis dedicado: conveniente si se necesita mayor control operativo, limites propios, networking dedicado o politicas avanzadas de disponibilidad.
- Alternativa como Supabase o PostgreSQL: conveniente si el producto necesita historico analitico, reportes complejos, auditoria, cohortes, licencias, consultas relacionales o exportaciones estructuradas.

La decision no debe basarse solo en costo. Debe considerar ownership, recuperacion ante fallos, reportabilidad pedagogica, privacidad y separacion futura entre progreso anonimo y licencias comerciales.

### 6.5 Backups

Se debe definir una estrategia de backup/export antes de incorporar usuarios reales de forma sostenida.

Lineamientos minimos:

- Export periodico de claves `progress:*`.
- Procedimiento de restauracion probado.
- Retencion definida por etapa del producto.
- Separacion entre datos de produccion y datos de prueba.
- Documentacion de quien puede ejecutar exportaciones y restauraciones.

Mientras no exista backup, Redis debe considerarse suficiente para MVP/piloto controlado, pero no como base madura de largo plazo para historico pedagogico.

## 7. Decisión actual

Se acepta el uso actual de Upstash via Vercel como solucion inicial por simplicidad, pero se planifica migracion a infraestructura controlada antes de escalar usuarios.
