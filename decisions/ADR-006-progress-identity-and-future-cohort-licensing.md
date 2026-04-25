# ADR-006 - Identidad de progreso y licencias futuras por cohorte

## Estado

Aceptada.

## Contexto

La app debe poder funcionar de manera autónoma, sin que INGENIUM tenga que crear usuarios, resetear cuentas o administrar manualmente familias durante el piloto. También debe permitir que varios alumnos sin vínculo operativo con el instituto conserven sus avances.

Todavía no está decidido si el modelo comercial será pago único, suscripción mensual o licencia por campaña. Resolver ese punto ahora obligaría a introducir seguridad, soporte de cuentas y reglas comerciales antes de validar el producto.

## Decisión

Se separan dos dominios:

- El progreso pertenece a un estudiante anónimo identificado por un código de progreso.
- La licencia comercial será una capa futura, separada del progreso.

En la implementación actual:

- La app genera o acepta un código de progreso.
- El código se guarda en la cookie `teksi75_progress`.
- El progreso se persiste por código: `progress:{code}` en Redis o `data/progress_{code}.json` en desarrollo.
- El reporte familiar se puede abrir desde otro dispositivo con `/reporte?code=...`.
- No se implementan cuentas, passwords, pagos ni licencias todavía.

## Licencia futura

Cuando se implemente monetización, la licencia debe agregarse como una capa nueva, sin mezclarla con el storage de progreso.

Modelo previsto:

```txt
src/licensing/
  license_store.ts
  middleware.ts
  LicenseBanner.tsx
```

Reglas comerciales previstas:

- 1 licencia corresponde a 1 estudiante y 1 adulto responsable.
- 1 licencia corresponde a 1 cohorte de ingreso, por ejemplo `uncuyo-2026`.
- La licencia puede tener una fecha de inicio y una fecha de vencimiento.
- El progreso sigue asociado al código del estudiante, no al dispositivo ni a la licencia.

Estados previstos:

| Estado | Fecha | Qué permite |
| --- | --- | --- |
| Activo | Dentro de `[validFrom, validUntil]` | Práctica, lectura, simulador, progreso y reporte |
| Consulta | Hasta un período corto posterior a `validUntil` | Dashboard, reporte y exportación. Sin práctica ni simulador |
| Expirado | Después del período de consulta | Exportación de datos históricos |

La licencia futura actuará como guardián de acceso. No debe cambiar la identidad de progreso ni el formato de almacenamiento de avances.

## Consecuencias

Esta decisión permite:

- Resolver multi-alumno y reporte parental ahora.
- Evitar datos personales en el MVP.
- Mantener abierta la decisión entre pago único, suscripción o licencia anual.
- Reducir el incentivo a prestar licencias en el futuro al vincular una licencia a un único estudiante y una única cohorte.

El trade-off es que el MVP no impide por completo el uso compartido del código de progreso. Esa restricción queda deliberadamente fuera del alcance actual y se abordará con la capa de licencias.
