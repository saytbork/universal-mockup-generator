# 🎭 DIVERSITY RANDOMIZER V2 - Resumen en Español

## 🚀 PROBLEMA RESUELTO

**Antes:**
- 1000 usuarios con Raw Domestic UGC → 1000 caras casi idénticas
- Mismo tipo de nariz, mandíbula, forma de cara
- Solo cambia: edad, género, color de pelo (lo que el usuario selecciona)
- Resultado: **Síndrome de "IA Clone"**

**Después:**
- 1000 usuarios con Raw Domestic UGC → 1000 personas únicas
- Diferente forma de cara, nariz, mandíbula, pómulos, ojos, cejas, labios
- Mantiene: edad, género, color de pelo (lo que el usuario selecciona)
- Resultado: **Personas reales y diversas**

---

## 🎯 CÓMO FUNCIONA CON TU SISTEMA ACTUAL

### LO QUE EL USUARIO CONTROLA (desde el UI)
Tu sistema Creator/Person **se mantiene intacto**:
- ✅ Edad (18-90) → **RESPETADO**
- ✅ Género (Female, Male, etc.) → **RESPETADO**
- ✅ Etnicidad (si especifica) → **RESPETADO**
- ✅ Tono de piel → **RESPETADO**
- ✅ Color de ojos → **RESPETADO**
- ✅ Largo de cabello → **RESPETADO**
- ✅ Textura de cabello → **RESPETADO**
- ✅ Color de cabello → **RESPETADO**
- ✅ Tipo de cuerpo → **RESPETADO**
- ✅ Expresión facial → **RESPETADO**

### LO QUE RAW DOMESTIC UGC CONTROLA
Tu sistema Raw Domestic UGC **se mantiene intacto**:
- ✅ Nivel de imperfección (Low/Medium/High) → **RESPETADO**
- ✅ Estilo de captura:
  - Torso-level handheld → **RESPETADO**
  - High-angle vantage → **RESPETADO**
  - Low-angle vantage → **RESPETADO**
  - Close face framing → **RESPETADO**
  - Propped on surface → **RESPETADO**

### LO QUE AÑADE EL DIVERSITY RANDOMIZER (automático)
**Solo lo que el usuario NO puede controlar:**
- 🎲 **Estructura facial única**
  - Forma de cara (oval, redonda, cuadrada, corazón, etc.)
  - Forma de mandíbula (suave, definida, fuerte, afilada, etc.)
  - Pómulos (sutiles, altos, pronunciados, planos)
  - Forma de ojos (almendrados, redondos, hundidos, etc.)
  - Forma de cejas (rectas, arqueadas, gruesas, delgadas)
  - Tipo de nariz (recta, curva, pequeña, ancha, aguileña, etc.)
  - Forma de labios (delgados, gruesos, anchos, cupido definido)
  - Frente (baja, promedio, alta)
  - Línea del cabello (recta, pico de viuda, redondeada)

- 🎲 **Textura de piel** (70% probabilidad)
  - Poros visibles en nariz y mejillas
  - Cicatrices leves de acné
  - Pecas en nariz y mejillas
  - Tono de piel desigual
  - Manchas solares
  - Lunar cerca de la boca
  - Líneas finas alrededor de los ojos
  - Brillo natural en zona T
  - Parches de piel seca

- 🎲 **Peinado** (no el largo/color, solo el estilo)
  - Sin peinar, natural
  - Despeinado, recién levantado
  - Recogido casualmente
  - Medio recogido, suelto
  - Raya al lado, natural
  - Raya al centro, casual
  - Detrás de una oreja
  - Raíces ligeramente grasosas
  - Frizz y pelos sueltos visibles
  - Secado al aire, sin producto

- 🎲 **Accesorios** (50% probabilidad, solo si no hay model reference)
  - Sin accesorios visibles
  - Aretes pequeños de botón
  - Aretes de aro, look usado
  - Múltiples perforaciones, estilo casual
  - Collar simple, metal mate
  - Collares en capas, delicados
  - Lentes de uso diario con reflejo leve
  - Perforación en nariz, sutil
  - Tatuaje pequeño visible en muñeca
  - Tatuaje pequeño visible en antebrazo
  - Anillos en dedos, estilo cotidiano
  - Smartwatch, casual
  - Pulsera de tela, usada

- 🎲 **Ropa** (solo UGC mode, solo si el usuario NO especificó wardrobe)
  - Sudadera oversize, descolorida
  - Camiseta lisa, ligeramente arrugada
  - Suéter de cuello redondo, usado
  - Camisa de franela, desabotonada
  - Tank top, casual
  - Camiseta de ajuste suelto con cuello estirado
  - Ropa deportiva, colores apagados
  - Chaqueta de mezclilla, usada
  - Camiseta con gráfico, print descolorido
  - Sudadera, casual
  - Cárdigan simple
  - Camisa abotonada, sin meter

- 🎲 **Vello facial** (solo masculino/presentación masculina, edad 18-75)
  - Bien afeitado
  - Barba ligera (1-2 días de crecimiento)
  - Barba corta, natural
  - Barba completa, recortada
  - Perilla, casual
  - Solo bigote
  - Vello facial irregular, desigual
  - Sombra de las 5

- 🎲 **Etnicidad** (SOLO si el usuario seleccionó "Non-specific")
  - Descendencia mediterránea
  - Descendencia del norte de Europa
  - Descendencia del este de Europa
  - Descendencia del sudeste asiático
  - Descendencia del este asiático
  - Descendencia del sur de Asia
  - Descendencia del oeste de África
  - Descendencia del norte de África
  - Descendencia caribeña
  - Descendencia latinoamericana
  - Descendencia del Medio Oriente
  - Herencia mixta (asiático-europeo)
  - Herencia mixta (africano-europeo)
  - Herencia mixta (latino-asiático)
  - Descendencia polinesia

---

## 📋 REGLAS DE INTEGRACIÓN

### PRIORIDAD 1: Model Reference
Si el usuario sube una foto de referencia:
- ❌ **NO randomizar NADA**
- ✅ Usar la foto exacta como está

### PRIORIDAD 2: Raw Domestic UGC Camera Control
Si Raw Domestic UGC está activo:
- ❌ **NO randomizar ángulo de cámara**
- ✅ Usar el estilo de captura seleccionado (torso-level, high-angle, etc.)
- ✅ Randomizar estructura facial, textura de piel, peinado, accesorios, ropa

### PRIORIDAD 3: Wardrobe del Usuario
Si el usuario especificó wardrobe style:
- ❌ **NO randomizar ropa**
- ✅ Usar el wardrobe especificado
- ✅ Randomizar estructura facial, textura de piel, peinado, accesorios

### PRIORIDAD 4: Etnicidad del Usuario
Si el usuario seleccionó una etnicidad específica (no "Non-specific"):
- ❌ **NO randomizar etnicidad**
- ✅ Usar la etnicidad seleccionada
- ✅ Randomizar estructura facial, textura de piel, peinado, accesorios, ropa

---

## 🎬 EJEMPLO REAL DE INTEGRACIÓN

### Usuario configura:
- **Creator/Person:**
  - Age: 30
  - Gender: Female
  - Ethnicity: Non-specific
  - Skin Tone: Medium Neutral
  - Eye Color: Brown
  - Hair Length: Shoulder
  - Hair Texture: Wavy
  - Hair Color: Dark brown

- **Raw Domestic UGC:**
  - ✅ Activo
  - Imperfection Level: High
  - Capture Style: Torso-level handheld

### Prompt generado:
```
30-year-old adult, Female, Medium Neutral skin, Brown eyes, 
Shoulder length Wavy Dark brown hair

FACIAL STRUCTURE: heart-shaped face, defined jawline, high cheekbones, 
almond-shaped eyes, arched brows, slightly curved nose bridge, full lips, 
average forehead, rounded hairline

[NO CAMERA ANGLE - respeta Raw UGC torso-level handheld]

SKIN TEXTURE: freckles across nose and cheeks

HAIR STYLING: tucked behind one ear

ACCESSORIES: small stud earrings only

CLOTHING: plain t-shirt, slightly wrinkled

ETHNICITY VARIATION: Southeast Asian descent (unique per generation)

[Resto del prompt de Raw Domestic UGC: torso-level, high imperfection, etc.]
```

---

## ✅ VENTAJAS DE ESTA IMPLEMENTACIÓN

1. **No rompe nada existente** → Todo tu UI funciona igual
2. **Respeta todos los controles del usuario** → Edad, género, pelo, etc.
3. **Respeta Raw Domestic UGC** → No interfiere con ángulos de cámara
4. **Añade diversidad donde faltaba** → Rasgos faciales únicos
5. **Automático** → No requiere cambios en el frontend
6. **Determinístico** → Mismos inputs = misma persona (para testing)

---

## 🔧 CONFIGURACIÓN ACTUAL

- ✅ Estructura facial: **SIEMPRE activa** (100% de generaciones)
- ✅ Ángulo de cámara: **DESACTIVADO en Raw UGC** (respeta control del usuario)
- ✅ Textura de piel: **70% de probabilidad** (ajustable)
- ✅ Peinado: **SIEMPRE activo** (100% de generaciones)
- ✅ Accesorios: **50% de probabilidad** (ajustable, respeta model reference)
- ✅ Ropa: **Solo UGC mode SIN wardrobe** (respeta selección del usuario)
- ✅ Vello facial: **Solo masculino** (respeta género)
- ✅ Etnicidad: **Solo si "Non-specific"** (respeta selección del usuario)

---

## 🎯 RESULTADO ESPERADO

**Antes:**
- Usuario 1: Genera 10 imágenes → 10 caras casi idénticas
- Usuario 2: Genera 10 imágenes → 10 caras casi idénticas (y similares al Usuario 1)

**Después:**
- Usuario 1: Genera 10 imágenes → 10 caras diferentes (misma edad/género/pelo, diferente estructura facial)
- Usuario 2: Genera 10 imágenes → 10 caras diferentes (distintas al Usuario 1)

**Escala:**
- 1000 usuarios × 10 imágenes = **10,000 personas únicas**
- Cada una con: misma edad/género/pelo (controlado por usuario)
- Pero: diferente nariz, mandíbula, pómulos, ojos (randomizado automáticamente)

---

## 📊 TESTING RECOMENDADO

1. **Test 1: Sin Raw UGC**
   - Generar 5 imágenes con Creator/Person estándar
   - Verificar: ✅ Caras diferentes, ✅ Edad/género/pelo consistente

2. **Test 2: Con Raw UGC**
   - Activar Raw Domestic UGC (torso-level handheld)
   - Generar 5 imágenes
   - Verificar: ✅ Caras diferentes, ✅ Ángulo torso-level respetado

3. **Test 3: Con Model Reference**
   - Subir foto de referencia
   - Generar 5 imágenes
   - Verificar: ✅ Misma cara en todas (no randomizado)

4. **Test 4: Con Wardrobe específico**
   - Especificar wardrobe style
   - Generar 5 imágenes
   - Verificar: ✅ Caras diferentes, ✅ Ropa consistente (no randomizada)

---

## 🚀 STATUS

- ✅ **Código implementado**
- ✅ **Integrado con Raw Domestic UGC**
- ✅ **Respeta todos los controles del usuario**
- ✅ **Listo para producción**

**Fecha:** 17 de febrero de 2026  
**Versión:** V2.0  
**Branch:** preview
