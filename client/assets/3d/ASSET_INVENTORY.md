# JORUMI - Asset Inventory
## Lista completa de assets 3D requeridos

> **Estado:** 📋 Especificado - Pendiente de generación  
> **Última actualización:** Enero 2026

---

## 📊 Resumen

| Categoría | Total Assets | Prioridad Alta | Variantes | Estado |
|-----------|-------------|----------------|-----------|--------|
| Personajes | 5 | 5 | 8 | ⏳ Pendiente |
| Recursos | 4 | 4 | 8 | ⏳ Pendiente |
| Vehículos | 3 | 2 | 3 | ⏳ Pendiente |
| Dados | 5 | 3 | 0 | ⏳ Pendiente |
| **TOTAL** | **17** | **14** | **19** | **⏳** |

---

## 👥 PERSONAJES (5 base + 8 variantes)

### Prioridad 1 (Core Gameplay)

| # | Asset | Archivo | Poly Budget | Texturas | Estado |
|---|-------|---------|-------------|----------|--------|
| 1 | Doctor | `char_doctor_01.glb` | 3000-4000 | 2048² | ⏳ |
| 2 | Soldado | `char_soldier_01.glb` | 4000-5000 | 2048² | ⏳ |
| 3 | Campesino | `char_peasant_01.glb` | 2500-3500 | 2048² | ⏳ |
| 4 | Constructor | `char_constructor_01.glb` | 3500-4500 | 2048² | ⏳ |
| 5 | Minero | `char_miner_01.glb` | 3500-4500 | 2048² | ⏳ |

### Variantes

| # | Variante | Archivo | Basado en | Estado |
|---|----------|---------|-----------|--------|
| 6 | Doctor herido | `char_doctor_wounded.glb` | Doctor | ⏳ |
| 7 | Soldado sin arma | `char_soldier_no_weapon.glb` | Soldado | ⏳ |
| 8 | Soldado herido | `char_soldier_wounded.glb` | Soldado | ⏳ |

**Ubicación:** `client/assets/3d/characters/{type}/`

---

## 📦 RECURSOS (4 base + 8 variantes)

### Prioridad 1 (Core Gameplay)

| # | Asset | Archivo | Poly Budget | Texturas | Estado |
|---|-------|---------|-------------|----------|--------|
| 1 | Comida (Caja) | `res_food_crate_01.glb` | 300-500 | 1024² | ⏳ |
| 2 | Medicina (Maletín) | `res_medicine_case_01.glb` | 400-600 | 1024² | ⏳ |
| 3 | Metal (Lingote) | `res_metal_ingot_01.glb` | 200-400 | 1024² | ⏳ |
| 4 | Minerales (Cristales) | `res_mineral_crystal_01.glb` | 400-800 | 1024² | ⏳ |

### Variantes

| # | Variante | Archivo | Descripción | Estado |
|---|----------|---------|-------------|--------|
| 5 | Comida (Paquete) | `res_food_package_01.glb` | Versión pequeña | ⏳ |
| 6 | Comida (Pila) | `res_food_pile_01.glb` | 3 cajas apiladas | ⏳ |
| 7 | Medicina (Vial) | `res_medicine_vial_01.glb` | Vial individual | ⏳ |
| 8 | Metal (Chatarra) | `res_metal_scrap_01.glb` | Pila de scrap | ⏳ |
| 9 | Metal (Placa) | `res_metal_plate_01.glb` | Placa construcción | ⏳ |
| 10 | Cristal (Simple) | `res_mineral_single_01.glb` | Cristal individual | ⏳ |
| 11 | Cristal (Fragmento) | `res_mineral_shard_01.glb` | Fragmento roto | ⏳ |

**Ubicación:** `client/assets/3d/resources/{type}/`

---

## 🚀 VEHÍCULOS Y ELEMENTOS CLAVE (3 base + 3 variantes)

### Prioridad 1

| # | Asset | Archivo | Poly Budget | Texturas | Estado |
|---|-------|---------|-------------|----------|--------|
| 1 | Nave Nodriza | `veh_mothership_01.glb` | 8000-15000 | 2048² | ⏳ |
| 2 | Barca Transporte | `veh_transport_boat_01.glb` | 4000-6000 | 2048² | ⏳ |

### Prioridad 2

| # | Asset | Archivo | Poly Budget | Texturas | Estado |
|---|-------|---------|-------------|----------|--------|
| 3 | Plataforma Flotante | `veh_floating_platform_01.glb` | 5000-8000 | 2048² | ⏳ |
| 4 | Nave Auxiliar | `veh_escape_ship_01.glb` | 3000-5000 | 2048² | ⏳ |

### LOD Variantes (Nave Nodriza)

| # | Variante | Archivo | Poly Count | Uso | Estado |
|---|----------|---------|------------|-----|--------|
| 5 | Nodriza LOD1 | `veh_mothership_lod1.glb` | ~8000 | Gameplay default | ⏳ |
| 6 | Nodriza LOD2 | `veh_mothership_lod2.glb` | ~3000 | Vista lejana | ⏳ |

### Variantes de Daño

| # | Variante | Archivo | Descripción | Estado |
|---|----------|---------|-------------|--------|
| 7 | Nodriza dañada 1 | `veh_mothership_damaged_01.glb` | Daño medio | ⏳ |
| 8 | Nodriza dañada 2 | `veh_mothership_damaged_02.glb` | Daño severo | ⏳ |

**Ubicación:** `client/assets/3d/vehicles/{name}/`

---

## 🎲 DADOS (5 tipos)

### Prioridad 1

| # | Asset | Archivo | Caras | Poly Budget | Estado |
|---|-------|---------|-------|-------------|--------|
| 1 | Dado Ataque Alienígena | `dice_alien_attack.glb` | 6 símbolos | 800-1200 | ⏳ |
| 2 | Dado Acción Alienígena | `dice_alien_action.glb` | 6 símbolos | 800-1200 | ⏳ |
| 3 | Dado Humano D6 | `dice_human_d6.glb` | 1-6 pips | 500-800 | ⏳ |

### Prioridad 2

| # | Asset | Archivo | Caras | Poly Budget | Estado |
|---|-------|---------|-------|-------------|--------|
| 4 | Dados Humanos 2D3 | `dice_human_2d3.glb` | 1-3 (x2) | 500-800×2 | ⏳ |
| 5 | Dado Combate | `dice_combat.glb` | Hit/Miss | 600-1000 | ⏳ |

### Símbolos de Dados

**Dado Ataque Alienígena:**
- Escudo (2 caras)
- Control (1 cara)
- Ataque (2 caras)
- Ataque Doble (1 cara)

**Dado Acción Alienígena:**
- Movimiento (2 caras)
- Escaneo (2 caras)
- Bomba (1 cara)
- Especial (1 cara)

**Dado Combate:**
- Miss (2 caras)
- Hit (3 caras)
- Critical (1 cara)

**Ubicación:** `client/assets/3d/dice/{type}/`

---

## 🏗️ EDIFICIOS (Futuro - Fase 2)

| # | Asset | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | Búnker | `bld_bunker_01.glb` | Media | 📅 Futuro |
| 2 | Hospital | `bld_hospital_01.glb` | Media | 📅 Futuro |
| 3 | Taller | `bld_workshop_01.glb` | Media | 📅 Futuro |
| 4 | Baliza | `bld_beacon_01.glb` | Alta | 📅 Futuro |

**Ubicación:** `client/assets/3d/buildings/{type}/`

---

## 🗺️ LOSETAS (Futuro - Fase 2)

| # | Asset | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | Guetto | `tile_ghetto_01.glb` | Alta | 📅 Futuro |
| 2 | Bosque | `tile_forest_01.glb` | Media | 📅 Futuro |
| 3 | Mina | `tile_mine_01.glb` | Media | 📅 Futuro |
| 4 | Ruinas | `tile_ruins_01.glb` | Media | 📅 Futuro |
| 5 | Tierra Baldía | `tile_wasteland_01.glb` | Baja | 📅 Futuro |

**Ubicación:** `client/assets/3d/tiles/{type}/`

---

## 📏 Especificaciones Técnicas Globales

### Formatos
- **Primario:** GLB (glTF 2.0 Binary)
- **Backup:** GLTF + texturas separadas

### Escalas
- **1 unidad = 1 metro**
- Personaje estándar: 1.75 m
- Dados: 16 mm (0.016 m)

### Texturas
- Personajes/Vehículos: 2048×2048 px
- Recursos/Props: 512-1024 px
- Formato: PNG (transparencia) o JPG (opaco)
- Canales PBR: BaseColor, Normal, MetallicRoughness

### Materiales
- Workflow PBR
- Nomenclatura: `MAT_{Asset}_{Purpose}`
- Valores apropiados de roughness/metallic

### Optimización
- Compresión GLB activada
- Draco opcional (requiere decoder)
- Tamaño objetivo: <500KB props, <1MB personajes, <2MB vehículos

---

## 🎯 Plan de Producción

### Fase 1: Core Gameplay (Semana 1-2)
✅ Especificaciones completadas  
⏳ Generar:
- [ ] 5 personajes base
- [ ] 4 recursos base
- [ ] 3 dados prioritarios

### Fase 2: Elementos Clave (Semana 3)
- [ ] Nave nodriza (+ LODs)
- [ ] Barca de transporte
- [ ] 2 dados restantes

### Fase 3: Variantes (Semana 4)
- [ ] Personajes heridos
- [ ] Variantes de recursos
- [ ] Plataforma flotante

### Fase 4: Edificios y Losetas (Futuro)
- [ ] 4 tipos de edificios
- [ ] 5 tipos de losetas
- [ ] Efectos visuales adicionales

---

## 📊 Presupuesto de Rendimiento

### Por Frame (Target: 60 FPS)
- **Draw Calls:** <100
- **Triangles totales:** <500K
- **Texturas cargadas:** <50MB VRAM
- **Luces activas:** <8

### Estrategias
- Usar instanced meshes para recursos repetidos
- LOD system para nave nodriza
- Frustum culling automático
- Occlusion culling para elementos ocultos

---

## ✅ Checklist de Calidad

Por cada asset:
- [ ] Formato GLB con texturas embebidas
- [ ] Escala correcta (1 unidad = 1 metro)
- [ ] Origen/pivot correctamente posicionado
- [ ] Nombres de mallas claros
- [ ] Materiales PBR configurados
- [ ] Presupuesto de polígonos respetado
- [ ] Texturas optimizadas (potencias de 2)
- [ ] Probado en Three.js Editor
- [ ] Sin errores de validación glTF
- [ ] Tamaño de archivo razonable

---

## 🔗 Referencias

- **Especificaciones técnicas:** Ver `/specs/*.json`
- **Prompts de generación:** Ver `/prompts/*.md`
- **Código de integración:** Ver `/examples/*.tsx`
- **Guía de integración:** Ver `INTEGRATION_GUIDE.md`

---

## 📝 Notas

### Convenciones de Nomenclatura
```
{category}_{name}_{variant?}.glb

Ejemplos:
- char_doctor_01.glb
- res_food_crate_01.glb
- veh_mothership_lod1.glb
- dice_alien_attack.glb
```

### Estructura de Carpetas
```
client/assets/3d/
├── characters/
│   ├── doctor/
│   ├── soldier/
│   └── ...
├── resources/
│   ├── food/
│   ├── medicine/
│   └── ...
├── vehicles/
│   ├── mothership/
│   └── ...
└── dice/
    ├── alien_attack/
    └── ...
```

---

**Versión:** 1.0  
**Total Assets Base:** 17  
**Total con Variantes:** 36  
**Estado Global:** ⏳ Especificado, pendiente de generación


