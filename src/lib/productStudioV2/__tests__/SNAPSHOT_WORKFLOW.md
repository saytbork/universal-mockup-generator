# SNAPSHOT_WORKFLOW.md

> Este workflow aplica exclusivamente a ProductStudioV2. No aplica a V1 ni a pipelines experimentales.


## 1️⃣ Propósito

El sistema ProductStudioV2 utiliza dos niveles de snapshot para garantizar determinismo y detectar regresiones:

- **Output final (string):** snapshot del prompt generado tras finalizePromptFromSegments.
- **Segment structure (pre-finalize):** snapshot del array de segments antes de ensamblar el string final.

Ambos niveles son obligatorios para proteger contra cambios accidentales en lógica, orden, shape o sanitización.

## 2️⃣ Regla de oro

- **No usar `-u` ni auto-update de snapshots.**
- **No normalizar strings ni JSON en los tests.**
- **No modificar snapshots manualmente sin inspección y validación.**
- **No cambiar la estructura interna:**
  ```ts
  Segment = {
    type: string,
    content: string
  }
  ```
- **No modificar finalizePromptFromSegments sin validación manual de todos los snapshots.**

## 3️⃣ Procedimiento de actualización

### Para snapshots finales (output string)

1. Ejecuta los tests:
   ```sh
   npx vitest run src/lib/productStudioV2/__tests__/generateStudioPromptV2.snapshot.test.ts
   ```
2. Si falla un snapshot:
   - Revisa el diff.
   - Valida la intención del cambio.
   - Si es correcto, regenera los snapshots con:
     ```sh
     npx tsx --tsconfig tsconfig.json src/lib/productStudioV2/__tests__/generateSnapshots.ts
     ```
   - Haz commit explícito del cambio.

### Para snapshots estructurales (segments)

1. Ejecuta:
   ```sh
   npx tsx --tsconfig tsconfig.json src/lib/productStudioV2/__tests__/generateSegmentSnapshots.ts
   ```
2. No toques imports ni extensiones.
3. No edites los .json manualmente salvo para inspección/validación.
4. Haz commit explícito del cambio.

## 4️⃣ Advertencia importante

Cualquier modificación en la estructura de segments o en finalizePromptFromSegments puede romper determinismo y requiere validación manual de todos los snapshots.

**Motivo:**

El sistema está en nivel:
- Arquitectura modular
- Determinismo validado
- Snapshot locked
- Structural locked

Esto es motor de producción serio. El workflow documentado es obligatorio para mantener la integridad y confiabilidad del sistema a futuro.

## 5️⃣ Criterio para aceptar cambios en snapshots

Un snapshot solo puede actualizarse si:

- El cambio fue intencional.
- Existe ticket o issue asociado.
- Se documentó el impacto en el prompt.
- Se validó que no rompe determinismo en otros perfiles.

Nunca actualizar snapshots para “hacer pasar el test”.

Esto previene degradación cultural del sistema.

## 6️⃣ Dependencia entre snapshots

El snapshot estructural (segments) tiene prioridad sobre el snapshot final.
Si el snapshot final cambia pero el estructural no, revisar sanitización.
Si el estructural cambia, el final necesariamente cambiará.

Esto ayuda a diagnosticar fallas más rápido.

## 7️⃣ Nota sobre orden

El orden de segments es parte del contrato.
Reordenamientos internos son considerados breaking changes.

---

✔ Documento profesional
✔ Flujo reproducible
✔ Regla clara
✔ Sin hacks
✔ Enfocado en determinismo

Con estos refuerzos el sistema queda realmente enterprise-level.

## 8️⃣ Cambios considerados Breaking Changes

Se consideran breaking changes:

- Modificar el shape de Segment.
- Reordenar bloques internos.
- Cambiar contenido literal de guardrails.
- Alterar sanitizePromptLexicalGuard.
- Alterar finalizePromptFromSegments.
- Introducir nuevos bloques sin actualización explícita de snapshots.

Cualquier breaking change requiere:
- Revisión técnica.
- Justificación documentada.
- Validación manual completa.
- Actualización consciente de snapshots.

---

Este documento ahora es control de cambios y gobernanza técnica.
