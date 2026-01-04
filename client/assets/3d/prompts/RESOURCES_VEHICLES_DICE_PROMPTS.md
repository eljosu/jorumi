# JORUMI - Resources, Vehicles & Dice Generation Prompts

---

## 🥫 RESOURCES

### FOOD (Comida)

#### Prompt Text-to-3D
```
Low poly 3D model of futuristic food supply crate, rectangular container 
with handles, metallic reinforcements, food symbol stenciled on sides, 
green and brown colors, slightly worn plastic material, industrial design, 
0.3 meters wide, game-ready 300-500 polygons, PBR materials, centered, 
no background, suitable for web rendering Three.js
```

#### Technical Blender Specs
```
Object: Food Supply Crate
Size: 0.3m × 0.25m × 0.3m (W×H×D)
Poly budget: 300-500 tris

Design:
- Rectangular container with beveled edges
- Two side handles (loop style)
- Food icon embossed on front/sides (grain symbol or generic food)
- Panel lines indicating compartments
- Corner reinforcements (metallic)

Materials:
- Body: Plastic/composite, #6B8E6B, roughness 0.6
- Reinforcements: Metal, #6B7280, roughness 0.4, metallic 0.7
- Labels: Stenciled, #E8E8E8

Variations needed:
- res_food_crate_01.glb (single)
- res_food_package_01.glb (smaller, 0.15m)
- res_food_pile_01.glb (3 stacked)
```

---

### MEDICINE (Medicina)

#### Prompt Text-to-3D
```
Low poly 3D model of futuristic medical supply case, white plastic briefcase 
style, large red cross symbol on top and sides, metallic latches, sterile 
clean appearance, rectangular shape 0.35 meters wide, game-ready 400-600 
polygons, PBR materials, centered on origin, no background
```

#### Technical Specs
```
Object: Medical Supply Case
Size: 0.35m × 0.15m × 0.25m
Poly budget: 400-600 tris

Design:
- Briefcase/hard case style
- Top handle (molded into case)
- Large red cross embossed on top (5mm relief)
- Smaller crosses on sides
- Panel lines indicating opening
- Corner latches (metallic)

Materials:
- Case: White plastic, #E8E8E8, roughness 0.5
- Cross: Red, #C13030, roughness 0.6
- Latches: Metal, #6B7280, metallic 0.8
- Optional: Cyan LED indicator strip (emission 0.3)

Variations:
- res_medicine_case_01.glb (main)
- res_medicine_vial_01.glb (single glowing vial)
```

---

### METAL (Metal)

#### Prompt Text-to-3D
```
Low poly 3D model of futuristic refined metal ingot, industrial metal bar, 
rectangular with beveled edges, silver gray metallic material, stamped 
serial numbers on top, clean industrial appearance, 0.25 meters long, 
game-ready 200-400 polygons, high metallic PBR material, centered
```

#### Technical Specs
```
Object: Metal Ingot
Size: 0.15m × 0.08m × 0.25m
Poly budget: 200-400 tris

Design:
- Classic ingot shape (trapezoid profile)
- Beveled top edges
- Stamped text/numbers on top surface (normal map detail)
- Slight surface imperfections
- Cast seam line on sides

Materials:
- Body: Metallic silver, #A8B2BB
- Metallic: 0.9
- Roughness: 0.3
- Normal map: Scratches and stamps

Variations:
- res_metal_ingot_01.glb (clean ingot)
- res_metal_scrap_01.glb (pile of tech scrap)
- res_metal_plate_01.glb (flat construction plate)
```

---

### MINERALS (Minerales/Diamantes)

#### Prompt Text-to-3D
```
Low poly 3D model of alien crystal cluster, geometric crystalline formation, 
translucent cyan and purple glowing crystals, sharp faceted edges, multiple 
crystals of varying sizes in cluster, sci-fi mineral, 0.2 meters tall, 
game-ready 400-800 polygons, glowing emissive material, centered
```

#### Technical Specs
```
Object: Alien Crystal Cluster
Size: 0.2m × 0.25m × 0.2m
Poly budget: 400-800 tris

Design:
- 3-5 crystal shards in a cluster
- Low poly faceted appearance (not smooth)
- Varied heights and angles
- Sharp points
- Base connection point (shared material)

Materials:
- Crystal: Translucent, #00D9FF base
- Emission: #00D9FF, strength 0.3
- Transparency: 0.3 (alpha blend)
- Roughness: 0.1
- Metallic: 0.0
- Interior glow effect (emission from core)

Variations:
- res_mineral_crystal_01.glb (cluster)
- res_mineral_single_01.glb (single large crystal)
- res_mineral_shard_01.glb (broken shard)
```

---

## 🚀 VEHICLES

### TRANSPORT BOAT (Barca de Transporte)

#### Prompt Text-to-3D
```
Low poly 3D model of improvised futuristic hover boat, makeshift transport 
vessel cobbled from salvage, wide flat hull with visible thrusters, welded 
metal plates, cargo area in center, simple control console, orange and gray 
colors, functional industrial design, 4 meters long, game-ready 4000-6000 
polygons, glowing thruster elements, dystopian sci-fi
```

#### Technical Specs
```
Object: Human Transport Hover Boat
Size: 4.0m × 2.5m × 1.5m (L×W×H)
Poly budget: 4000-6000 tris

Design:
- Low, wide boat hull shape
- Hover thrusters underneath (4 visible)
- Cargo bed in center (flat area)
- Simple pilot console at front (small)
- Welded panel construction (visible seams)
- Mismatched plates (salvaged aesthetic)
- Side railings (simple tube/bars)

Materials:
- Hull: Mixed metals, #6B7280, roughness 0.6, weathered
- Accent panels: #D97629 (construction orange)
- Thrusters: Metallic, #4A5568
- Thruster glow: #00D9FF, emission 0.7

Separate meshes:
- Hull_Main
- Thrusters (x4)
- Console
- Cargo_Area

Animation ready: Gentle hover float animation
```

---

### ALIEN MOTHERSHIP (Nave Nodriza)

#### Prompt Text-to-3D
```
Low poly 3D model of massive alien mothership, biomechanical design, 
organic-technological hybrid, elongated hull with tentacle protrusions, 
dark purple and black colors, glowing cyan bioluminescent seams, multiple 
weapon ports, pulsing core visible, menacing evil appearance, 25 meters 
long, game-ready 8000-15000 polygons, highly detailed emissive elements
```

#### Technical Specs
```
Object: Alien Capital Ship
Size: 25.0m × 15.0m × 8.0m (massive presence)
Poly budget: 8000-15000 tris (LOD required)

Design:
- Elongated, asymmetric but balanced
- Organic flowing hull shapes
- Biomechanical surface detail (H.R. Giger inspired)
- Multiple antenna/tentacle protrusions (4-6)
- Visible pulsing core chamber (central)
- Weapon ports (6-8 visible openings)
- Glowing seams like veins
- Alien hieroglyph details (optional)

Materials:
- Hull: Dark purple, #4A235A, roughness 0.4, metallic 0.3
- Secondary: Black-blue, #0D1B2A, roughness 0.3
- Bioluminescent seams: #00D9FF, emission 0.5, animated pulse
- Core: Bright green, #39FF14, emission 1.5, strong pulse
- Weapon ports: #39FF14, emission 0.8

Separate meshes:
- Hull_Main
- Hull_Details
- Core_Chamber
- Weapon_Array
- Glow_Seams (for animation)
- Tentacles (separate for animation)

Animation ready:
- Core pulse (emission intensity 1.0-1.5 loop)
- Seam pulse (slower, offset from core)
- Gentle rotation and float
- Weapon charge effect

LOD levels:
- LOD0: 15000 tris (close inspection)
- LOD1: 8000 tris (gameplay default)
- LOD2: 3000 tris (far view)
```

---

### FLOATING PLATFORM (Taller Clandestino)

#### Prompt Text-to-3D
```
Low poly 3D model of hidden floating workshop platform, industrial makeshift 
base, flat hovering platform with workshop structure on top, rusted metal, 
improvised walls, communication antenna, storage containers, camouflage 
netting, 6 meters wide, game-ready 5000-8000 polygons, dystopian secret base
```

#### Technical Specs
```
Object: Clandestine Floating Workshop
Size: 6.0m × 6.0m × 3.0m
Poly budget: 5000-8000 tris

Design:
- Flat platform base (hexagonal or square)
- Hover tech underneath (4 corner thrusters)
- Workshop shed structure on top (partial walls)
- Tool racks and workbenches visible
- Communication antenna (tall, thin)
- Storage containers (2-3 stacked)
- Tarp/netting draped over sections
- Landing pad area marked

Materials:
- Platform: Rusted metal, #6B7280, roughness 0.8
- Rust: #8B4513, overlay in roughness map
- Workshop: #4A5568, industrial
- Containers: #D97629 (orange)
- Netting: Transparent, low opacity

Separate meshes:
- Platform_Base
- Hover_Tech
- Workshop_Structure
- Equipment
- Containers
- Antenna

Lights:
- Workshop interior: warm white, emission 0.4
- Hover indicators: cyan, emission 0.3
```

---

## 🎲 DICE

### ALIEN ATTACK DIE

#### Prompt Text-to-3D
```
Low poly 3D model of alien attack dice D6, dark purple biomechanical 
appearance, six faces with carved glowing symbols: shield icon (2 faces), 
tentacle control icon (1 face), single claw attack (2 faces), double claw 
explosion (1 face), symbols glow bright green, 16mm cube size, game-ready 
800-1200 polygons, carved relief symbols, centered on origin
```

#### Technical Specs
```
Object: Alien Attack D6
Size: 0.016m × 0.016m × 0.016m (16mm standard die)
Poly budget: 800-1200 tris

Face Symbols (embossed/carved):
1. SHIELD - Hexagonal shield with alien pattern
2. SHIELD - (same as face 1)
3. CONTROL - Tentacle/hand grasping symbol
4. ATTACK - Single claw slash mark
5. ATTACK - (same as face 4)
6. DOUBLE_ATTACK - Double claw or explosion burst

Design:
- Slightly organic cube edges (not perfectly square)
- Symbols carved 0.5mm into face (recessed)
- Symbols have clean, readable silhouette
- Alien aesthetic but clear iconography

Materials:
- Body: Dark purple, #4A235A, roughness 0.4, metallic 0.1
- Symbols: Bright green, #39FF14, emission 0.6
- Slight body surface noise (organic texture)

Physics: Center of mass at geometric center (0,0,0)
```

---

### ALIEN ACTION DIE

#### Prompt Text-to-3D
```
Low poly 3D model of alien action dice D6, dark navy blue biomechanical 
appearance, six faces with carved glowing cyan symbols: movement arrow 
(2 faces), radar scan (2 faces), bomb explosion (1 face), special star 
glyph (1 face), 16mm cube, game-ready 800-1200 polygons
```

#### Technical Specs
```
Object: Alien Action D6
Size: 0.016m cube
Poly budget: 800-1200 tris

Face Symbols:
1. MOVE - Directional arrow
2. MOVE - (same)
3. SCAN - Radar waves or eye
4. SCAN - (same)
5. BOMB - Explosion symbol
6. SPECIAL - Complex alien glyph or star

Materials:
- Body: Navy black, #0D1B2A, roughness 0.4, metallic 0.2
- Symbols: Cyan, #00D9FF, emission 0.6
- Same organic edge treatment as attack die
```

---

### HUMAN D6

#### Prompt Text-to-3D
```
Low poly 3D model of standard six-sided dice D6, military olive green color, 
white painted pips (dots 1-6), slightly worn and weathered appearance, 
battle-used look, 16mm cube, game-ready 500-800 polygons, realistic gaming die
```

#### Technical Specs
```
Object: Human Standard D6
Size: 0.016m cube
Poly budget: 500-800 tris

Face Numbers: Standard pips 1-6
- Opposite sides sum to 7 (1↔6, 2↔5, 3↔4)

Design:
- Standard D6 shape with slight edge bevel
- Pips as recessed spherical indents (0.3mm deep)
- Worn corners and edges
- Slight dirt/grime texture

Materials:
- Body: Olive green, #4A5D4A, roughness 0.6
- Pips: Off-white, #E8E8E8, painted look
- Weathering: Slight edge wear, scratches

Standard die layout applies
```

---

### COMBAT DIE

#### Prompt Text-to-3D
```
Low poly 3D model of combat dice D6, black aggressive military design, 
faces with symbols: X miss symbol (2 faces), red crosshair hit (3 faces), 
red skull critical hit (1 face), tactical military appearance, 16mm cube
```

#### Technical Specs
```
Object: Combat D6
Size: 0.016m cube
Poly budget: 600-1000 tris

Face Symbols:
1. MISS - X symbol or blank
2. MISS - (same)
3. HIT - Crosshair target
4. HIT - (same)
5. HIT - (same)
6. CRITICAL - Skull or explosion icon

Materials:
- Body: Black, #2B2B2B, roughness 0.5, military matte
- Miss symbols: Gray, #6B7280
- Hit symbols: Red, #C13030
- Critical: Bright red, #FF4444, optional emission 0.2

Aggressive, tactical aesthetic
```

---

## 🎯 General AI Generation Tips

### For All Assets:

**Meshy.ai Settings:**
- AI Model: V4 or latest
- Topology: Game Ready
- Target Polycount: Specify in prompt
- Export: GLB with embedded textures

**Common Post-Processing:**
1. Import to Blender
2. Check scale (use measuring tape)
3. Center origin to base
4. Verify UVs are unwrapped
5. Set up proper PBR materials
6. Enable compression on export

**Quality Checklist:**
- ✅ Correct scale relative to other assets
- ✅ Clean topology (no overlapping faces)
- ✅ Proper UV unwrapping
- ✅ Materials use PBR workflow
- ✅ Pivot point correctly placed
- ✅ File size reasonable (<1MB for props, <2MB for vehicles)

---

## 📋 Priority Generation Order

### Phase 1 - Core Gameplay (Week 1)
1. All 5 characters (Doctor, Soldier, Peasant, Constructor, Miner)
2. All 4 resources (Food, Medicine, Metal, Minerals)
3. Human D6 and Combat dice

### Phase 2 - Key Elements (Week 2)
4. Alien Mothership (LOD0 and LOD1)
5. Transport Boat
6. Alien Attack and Action dice

### Phase 3 - Complete Set (Week 3)
7. Floating Platform
8. Escape Ship
9. Character variants (wounded, etc.)
10. Resource variants (piles, stacks)

---

## 🔗 Recommended Generation Tools by Asset Type

| Asset Type | Best Tool | Reason |
|------------|-----------|--------|
| Characters | Meshy.ai V4 | Good topology, rigging ready |
| Resources | Rodin.ai | Fast, simple objects |
| Vehicles | Meshy.ai + Manual | AI base + manual detail |
| Mothership | Manual Blender | Complex, needs precision |
| Dice | CSM.ai or Manual | Perfect geometry needed |



