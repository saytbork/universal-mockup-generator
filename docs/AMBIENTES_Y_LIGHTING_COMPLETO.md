# 🎨 AMBIENTES Y LIGHTING - Todas las Opciones

## 💡 ILUMINACIÓN (20 opciones)

Siempre se aplica en modo UGC. La iluminación es **SIEMPRE random** para dar autenticidad.

1. `harsh overhead bedroom light, yellow tint`
2. `dim natural light through window, underexposed`
3. `bright bathroom lighting, washed out skin`
4. `mixed lighting, warm and cool tones clashing`
5. `single lamp lighting, one side of face darker`
6. `phone flashlight visible in mirror reflection`
7. `backlit from window, face slightly shadowed`
8. `fluorescent kitchen lighting, greenish cast`
9. `evening mood lighting, amber/orange glow`
10. `ring light visible in glasses reflection`
11. `natural daylight but overcast, flat lighting`
12. `nighttime with bedside lamp, very warm tone`
13. `golden hour sunlight through window, warm side lighting`
14. `blue hour twilight, cool tones, dim`
15. `late night artificial light, very yellow/orange`
16. `early morning light, soft but directional`
17. `cloudy day through window, diffused gray light`
18. `desk lamp close to face, dramatic shadows`
19. `string lights or fairy lights in background, bokeh`
20. `TV screen glow as main light source, blue cast`

---

## 🏠 AMBIENTES/BACKGROUNDS (25 opciones)

Siempre se aplica en modo UGC. El ambiente es **SIEMPRE random** para máxima variedad.

### Dormitorio (5 opciones)
1. `unmade bed visible in background`
2. `clothes pile on chair or floor`
3. `cluttered nightstand with random items`
4. `bedroom wall with posters or photos`
5. `closet partially open with clothes visible`

### Baño (2 opciones)
6. `bathroom mirror with toothpaste spots`
7. `bathroom shower curtain visible behind`

### Cocina (2 opciones)
8. `kitchen counter with dishes in sink`
9. `kitchen appliances in background`

### Sala/Living (3 opciones)
10. `blurry TV or laptop screen in background`
11. `couch or sofa with throw pillows`
12. `bookshelf with messy arrangement`

### Genéricos/Neutros (5 opciones)
13. `laundry basket visible`
14. `window with blinds half open`
15. `plain wall, no decoration`
16. `doorway to another room visible`
17. `curtains or drapes partially drawn`

### Otros Ambientes (8 opciones)
18. `pet bed or cat tower in corner`
19. `car interior (driver seat or passenger)`
20. `houseplants on windowsill or shelf`
21. `framed photos or art on wall behind`
22. `ceiling fan or light fixture visible above`
23. `desk with papers and clutter`
24. `gym equipment or yoga mat visible`
25. `staircase railing in background`

---

## 🔀 CÓMO FUNCIONA LA RANDOMIZACIÓN

### Si el usuario especifica un ambiente:
```typescript
Usuario: "bedroom"
Output: "bedroom, with unmade bed visible in background"
        "bedroom, with clothes pile on chair or floor"
        "bedroom, with cluttered nightstand with random items"
```

### Si el usuario NO especifica:
```typescript
Output: "clothes pile on chair or floor"
        "bathroom mirror with toothpaste spots"
        "kitchen counter with dishes in sink"
```

---

## 📊 ESTADÍSTICAS

- **20 lighting options** × **25 background options** = **500 combinaciones únicas** de ambiente
- Cada generación usa una combinación diferente
- **GARANTÍA**: 500 imágenes sin repetir el mismo ambiente/lighting

---

## 🎬 EJEMPLO COMPLETO

**Usuario configura:**
- Mode: UGC
- Wardrobe: "casual"
- Environment: "living room"

**Generación 1:**
```
LIGHTING: harsh overhead bedroom light, yellow tint
BACKGROUND: living room, with blurry TV or laptop screen in background
CLOTHING BASE: casual, but plain t-shirt clearly slept in
```

**Generación 2:**
```
LIGHTING: golden hour sunlight through window, warm side lighting
BACKGROUND: living room, with couch or sofa with throw pillows
CLOTHING BASE: casual, but baggy t-shirt with stains
```

**Generación 3:**
```
LIGHTING: fluorescent kitchen lighting, greenish cast
BACKGROUND: living room, with bookshelf with messy arrangement
CLOTHING BASE: casual, but old sweatshirt with stretched neck
```

Todas diferentes! 🔥

---

## ✅ TESTING CHECKLIST

Para verificar que funciona:

1. [ ] Generar 10 imágenes con mismo environment especificado
2. [ ] Verificar que las 10 tienen lighting diferente
3. [ ] Verificar que las 10 tienen elementos de fondo diferentes
4. [ ] Generar 10 imágenes SIN environment especificado
5. [ ] Verificar que las 10 tienen ambientes completamente random
6. [ ] Confirmar que no hay 2 imágenes con la misma combinación lighting+background
