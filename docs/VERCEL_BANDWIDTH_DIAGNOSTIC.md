# Vercel Bandwidth Diagnostic Report
**Date:** February 18, 2026  
**Project:** perfectmockup.com  
**Current Consumption:** 10.03 GB Fast Origin Transfer (100% of free tier limit)

---

## 🔴 PROBLEMA IDENTIFICADO

### Arquitectura actual de entrega de imágenes:

**El problema NO es analytics ni bots. El problema es la arquitectura de servicio de imágenes.**

#### Evidencia del código:

```typescript
// api/generate.ts línea 482 y 500:
res.status(200).json({
  ok: true,
  imageBase64: maybeWatermarkedImage,  // ← Devuelve base64 directo desde función
  // ...
});

// App.tsx línea 5495:
const finalUrl = `data:image/png;base64,${encodedImage}`;  // ← Se renderiza como data URL
setGeneratedImageUrl(outputUrl);  // ← Se guarda en estado como base64
```

### ¿Qué significa esto?

- ❌ Las imágenes NO se guardan en Firebase Storage
- ❌ Las imágenes NO se guardan en ningún storage externo
- ❌ Cada imagen se devuelve como **base64 desde la función serverless**
- ❌ Se renderizan directamente como **data URLs** en el cliente
- ❌ **CADA visualización sirve desde memory/compute de Vercel**
- ❌ **ZERO cache** - cada request golpea origin

---

## 📊 ANÁLISIS TÉCNICO

### Comparación: Análisis de Claude vs Realidad

| Afirmación de Claude | Realidad según GPT | Evidencia |
|---|---|---|
| ❌ Analytics = 30-40% del consumo | ✅ Analytics <5% del consumo | Scripts pesan 50-200 KB vs 10 GB total de transferencia |
| ✅ Usar localhost para desarrollo | ✅ Correcto (alta prioridad) | Testing en producción consume origin transfer |
| ❌ Bots como causa principal | ✅ Incorrecto | 110k requests son razonables, no hay patrón de scraping masivo |
| ❌ No mencionó la arquitectura | 🔴 **PROBLEMA REAL ENCONTRADO** | **Base64 desde función serverless = zero cache capability** |

### Métricas actuales de Vercel:

```
Fast Data Transfer:   31.53 GB  (normal)
Fast Origin Transfer: 10.03 GB  (🔴 100% del límite, CRÍTICO)
Edge Requests:        110k      (razonable)
Function Invocations: Bajas     (normal)
CPU Usage:            Baja      (normal)
```

**Diagnóstico:** No hay patrón de bot scraping. El consumo viene de arquitectura ineficiente de imágenes.

---

## 🎯 IMPACTO REAL DEL PROBLEMA

### Cálculo de consumo:

1. **Cada imagen generada:** ~2-5 MB en base64
2. **10 GB / 3 MB promedio = ~3,300 visualizaciones**
3. **Cada re-render, refresh, o view = nuevo origin transfer**
4. **Zero cache porque es data URL inline (no cacheable)**

### ¿Por qué el problema es crítico?

```
Usuario genera imagen → Vercel Function procesa → Devuelve base64 (3 MB)
Usuario refresca página → Vercel Function NO TIENE CACHE → Devuelve base64 otra vez (3 MB)
Usuario abre galería → Cada thumbnail carga desde origin → +3 MB por imagen
Usuario comparte link → Receptor carga desde origin → +3 MB más
```

**Total:** Cada imagen consume bandwidth **múltiples veces** porque no hay cache layer.

---

## ✅ SOLUCIONES DISPONIBLES

### Opción A: Firebase Storage (RECOMENDADO - Gratis)

**Ventajas:**
- ✅ Gratis hasta 1 GB/día de downloads (suficiente para arrancar)
- ✅ Firebase Storage tiene CDN propio incluido
- ✅ Vercel CDN puede cachear las URLs de Firebase
- ✅ Zero costo en Vercel origin transfer después del primer request
- ✅ **Ya tienes el código implementado** en `src/services/storageService.ts`

**Código necesario:**

```typescript
// Modificar api/generate.ts después de línea 448:
import { uploadToFirebaseStorage } from '../services/storageService';

// En lugar de:
const maybeWatermarkedImage = shouldApplyWatermark
  ? await applyLogoWatermarkToPngBase64(encodedImage)
  : encodedImage;

res.status(200).json({
  imageBase64: maybeWatermarkedImage,  // ❌ REMOVER
  // ...
});

// Hacer:
const maybeWatermarkedImage = shouldApplyWatermark
  ? await applyLogoWatermarkToPngBase64(encodedImage)
  : encodedImage;

// Subir a Firebase Storage
const userId = authenticatedEmail || guestId || 'guest';
const imageUrl = await uploadToFirebaseStorage(maybeWatermarkedImage, userId);

res.status(200).json({
  imageUrl: imageUrl,  // ✅ URL cacheable
  // ...
});
```

```typescript
// Modificar App.tsx línea 5487:
// En lugar de:
const encodedImage = typeof data?.imageBase64 === 'string' ? data.imageBase64 : '';
const finalUrl = `data:image/png;base64,${encodedImage}`;

// Hacer:
const imageUrl = typeof data?.imageUrl === 'string' ? data.imageUrl : '';
setGeneratedImageUrl(imageUrl);  // URL directa, no data URL
```

**Impacto esperado:**
- Bandwidth antes: **10 GB (base64 served from functions)**
- Bandwidth después: **<500 MB (solo metadata + CDN cache)**
- **Reducción: ~95% en origin transfer**

---

### Opción B: Vercel Blob Storage (Nativo pero de pago)

```bash
npm install @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

const blob = Buffer.from(maybeWatermarkedImage, 'base64');
const { url } = await put(`generated/${userId}_${timestamp}.png`, blob, {
  access: 'public',
  addRandomSuffix: true,
});

res.status(200).json({
  imageUrl: url,  // ← Vercel native CDN
});
```

**Ventajas:**
- ✅ Nativo de Vercel (mejor integración)
- ✅ CDN automático incluido
- ✅ No requiere configurar Firebase

**Desventajas:**
- ❌ **NO está en free tier**
- ❌ Costo: **$0.15/GB de storage**
- ❌ Para tu volumen: ~$5-10/mes adicionales

---

### Opción C: Cloudflare R2 (Alternativa económica)

**Ventajas:**
- ✅ 10 GB gratis de storage por mes
- ✅ **Zero costo de egress** (salida de datos gratis)
- ✅ CDN global de Cloudflare incluido

**Desventajas:**
- ❌ Requiere cuenta de Cloudflare
- ❌ Requiere configuración adicional (API keys, buckets)
- ❌ Más complejo que Firebase

---

## 📋 ACCIONES RECOMENDADAS

### Fase 1: Inmediato (HOY)

**Prioridad CRÍTICA:**
1. ✅ **Usar localhost para TODOS los tests** (`npm run dev` → `http://localhost:5173`)
   - NO usar `https://perfectmockup.com` para development
   - Cada generación en producción consume quota
2. ✅ Analytics deshabilitado (ya hecho, pero impacto <5%)

**Esto te da 48-72 horas de respiro para implementar el fix arquitectónico.**

---

### Fase 2: Fix Arquitectónico (Próximas 24-48 horas)

**Implementar Firebase Storage (Opción A - RECOMENDADO):**

#### Paso 1: Verificar configuración de Firebase
```bash
# Verificar si Firebase está activo
cat src/firebase/firebase.ts
```

Si Firebase está inactivo:
1. Ir a Firebase Console: https://console.firebase.google.com
2. Crear/activar proyecto
3. Habilitar Firebase Storage
4. Configurar reglas de seguridad básicas

#### Paso 2: Modificar api/generate.ts

```typescript
// Línea ~10 (imports):
import { uploadImage } from '../src/services/storageService';

// Línea ~448 (después de generar imagen):
const maybeWatermarkedImage = shouldApplyWatermark
  ? await applyLogoWatermarkToPngBase64(encodedImage)
  : encodedImage;

// NUEVO: Subir a Firebase Storage
const userId = authenticatedEmail || guestId || 'guest';
const { url: imageUrl } = await uploadImage(maybeWatermarkedImage, userId);

// Modificar respuesta:
res.status(200).json({
  ok: true,
  imageUrl: imageUrl,  // ← Cambio de imageBase64 a imageUrl
  anonymous_trial: isAnonymousTrial,
  trial_remaining: remaining,
  // ... resto de campos
});
```

#### Paso 3: Modificar App.tsx

```typescript
// Línea 5487 (handleGenerateImage):
const imageUrl = typeof data?.imageUrl === 'string' ? data.imageUrl : '';
if (!imageUrl) {
  throw new Error('Image generation failed or returned no image URL.');
}

// Línea 5495 (procesar imagen):
// REMOVER:
// const finalUrl = `data:image/png;base64,${encodedImage}`;

// REEMPLAZAR CON:
const finalUrl = imageUrl;  // URL directa de Firebase Storage

// Continuar con normalización si es necesario:
const cleanedFinalUrl = await trimBlackBarsDataUrl(finalUrl, { mimeType: 'image/png', background: null });
// ... resto del código
```

#### Paso 4: Testing

```bash
# Terminal 1: Iniciar dev server
npm run dev

# Terminal 2: Generar imagen de prueba
# Abrir http://localhost:5173
# Generar imagen
# Verificar en Network tab que devuelve imageUrl en lugar de imageBase64
```

#### Paso 5: Deploy

```bash
git add .
git commit -m "fix: migrate image delivery from base64 to Firebase Storage URLs

BREAKING CHANGE: Images now served from Firebase Storage CDN instead of inline base64
- Reduces Vercel origin transfer by ~95%
- Enables proper CDN caching
- Fixes bandwidth quota issues

Technical changes:
- api/generate.ts: Upload to Firebase Storage after generation
- App.tsx: Handle imageUrl instead of imageBase64
- Leverages existing storageService.ts infrastructure"

git push origin review-v2
```

---

### Fase 3: Monitoreo (48-72 horas después del deploy)

1. **Verificar Vercel Analytics:**
   - URL: https://vercel.com/dashboard/analytics
   - Métrica clave: **Fast Origin Transfer**
   - Esperado: Reducción de 10 GB → <1 GB

2. **Verificar Firebase Usage:**
   - URL: https://console.firebase.google.com
   - Storage → Usage
   - Esperado: <100 MB de storage, <1 GB de bandwidth/día

3. **Si el problema persiste:**
   - Revisar si hay requests antiguos cacheados
   - Verificar que todas las imágenes nuevas usan URLs de Firebase
   - Considerar agregar headers de cache agresivos en vercel.json

---

## 🔍 ESTADO DE FIREBASE

**PREGUNTA CRÍTICA PARA EL USUARIO:**

¿Firebase está completamente inactivo o solo no configuraste Storage?

- **Si Firebase está activo:** Proceder con Opción A (Firebase Storage) ✅
- **Si Firebase está inactivo y no quieres activarlo:** Considerar Opción C (Cloudflare R2)
- **Si tienes budget ($5-10/mes):** Opción B (Vercel Blob) es la más simple

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | Firebase Storage | Vercel Blob | Cloudflare R2 |
|---|---|---|---|
| **Costo inicial** | Gratis (1 GB/día) | $0.15/GB storage | Gratis (10 GB/mes) |
| **Costo bandwidth** | Incluido en free tier | Incluido en Vercel | **Zero egress cost** |
| **CDN incluido** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Setup complexity** | Baja (ya tienes código) | Muy baja | Media |
| **Ya implementado** | ✅ Parcialmente | ❌ No | ❌ No |
| **Migración futura** | Fácil | Media | Media |
| **Vendor lock-in** | Medio (Google) | Alto (Vercel) | Bajo (S3-compatible) |

---

## 🎯 RECOMENDACIÓN FINAL

### Para tu caso específico:

**Implementar Firebase Storage (Opción A)** porque:

1. ✅ Ya tienes el código en `src/services/storageService.ts`
2. ✅ Gratis hasta que generes revenue
3. ✅ Solo requiere activar Firebase y modificar 2 archivos
4. ✅ Reduce bandwidth 95% inmediatamente
5. ✅ No requiere pagar nada adicional

### Timeline sugerido:

- **Hoy:** Usar localhost exclusivamente para testing
- **Mañana:** Implementar Firebase Storage fix (2-3 horas de trabajo)
- **48-72h después:** Verificar reducción de bandwidth en Vercel Analytics
- **1 semana después:** Si todo OK, problema resuelto permanentemente

---

## 📝 NOTAS ADICIONALES

### ¿Por qué Claude falló en el diagnóstico?

1. Se enfocó en síntomas superficiales (analytics, bots)
2. No revisó la arquitectura de entrega de imágenes
3. No identificó que base64 inline = zero cache capability
4. Sobrestimó el impacto de analytics (30-40% vs <5% real)

### ¿Qué aprendimos?

- **Métricas engañan:** 110k requests parecían altos, pero son normales
- **Arquitectura importa más que optimizaciones:** Analytics <5%, arquitectura = 95%
- **Free tier tiene límites arquitectónicos:** Base64 inline no escala
- **CDN solo funciona con URLs estáticas:** Data URLs no son cacheables

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```markdown
### Pre-implementation
- [ ] Verificar estado de Firebase (activo/inactivo)
- [ ] Backup del código actual (git commit)
- [ ] Leer toda esta documentación

### Implementation
- [ ] Modificar api/generate.ts (agregar uploadImage call)
- [ ] Modificar App.tsx (cambiar imageBase64 → imageUrl)
- [ ] Testing en localhost (verificar que funciona)
- [ ] Verificar Network tab (debe devolver imageUrl)
- [ ] Deploy a review-v2

### Post-implementation
- [ ] Monitorear Vercel Analytics (24h)
- [ ] Verificar Firebase Usage (48h)
- [ ] Confirmar reducción de bandwidth (72h)
- [ ] Documentar resultados

### Rollback plan (si algo falla)
- [ ] git revert [commit-hash]
- [ ] git push origin review-v2 --force
```

---

## 🆘 TROUBLESHOOTING

### Si Firebase Storage falla:

```typescript
// Agregar logging detallado en storageService.ts:
export async function uploadImage(base64Data: string, userId: string) {
  try {
    console.log('🔵 Iniciando upload a Firebase Storage...');
    const blob = base64ToBlob(base64Data);
    console.log('🔵 Blob creado:', blob.size, 'bytes');
    
    const filename = generateFilename(userId);
    console.log('🔵 Filename:', filename);
    
    const storageRef = ref(storage, `generated/${filename}`);
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('✅ Upload exitoso:', snapshot.metadata.fullPath);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ URL generada:', downloadURL);
    
    return { url: downloadURL, path: snapshot.metadata.fullPath };
  } catch (error) {
    console.error('❌ Error en uploadImage:', error);
    throw error;
  }
}
```

### Si Vercel sigue consumiendo bandwidth:

1. Verificar que NO estés usando URLs viejas cacheadas
2. Limpiar localStorage del browser
3. Verificar en Network tab que las nuevas requests usan Firebase URLs
4. Revisar si hay código que todavía sirve base64

---

**Fin del reporte. Listo para compartir con GPT.**
