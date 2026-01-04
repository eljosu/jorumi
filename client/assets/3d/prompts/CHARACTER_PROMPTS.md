# JORUMI - Character Generation Prompts
## Prompts detallados para generación 3D con IA o modelado manual

> **Uso:** Estos prompts están optimizados para herramientas como Meshy.ai, Rodin.ai, Luma AI, o como referencia para modelado en Blender.

---

## 🎯 Estilo General para Todos los Personajes

**Base prompt para añadir a cada personaje:**
```
Low poly stylized 3D model, dystopian sci-fi style, realistic proportions, 
clean topology, game-ready asset for web, PBR materials, 1.75m height, 
T-pose or A-pose, facing forward, single character only, no background, 
plain lighting, centered on origin, suitable for Three.js rendering
```

---

## 👨‍⚕️ DOCTOR

### Prompt Completo (Text-to-3D)
```
Low poly 3D model of futuristic dystopian medic doctor, wearing white and 
light gray medical uniform with cyan blue technological accents, red cross 
emblem on chest, carrying high-tech medical backpack with glowing cyan vials, 
holding handheld medical scanner device, clean professional appearance, 
short practical hair, standing pose, realistic stylized proportions, 
human height 1.75 meters, game-ready asset, PBR materials, 3000-4000 polygons, 
dystopian sci-fi aesthetic, no background, centered, T-pose preferred
```

### Prompt Técnico (Blender / Manual)
```
Asset: Futuristic Medic Character
Style: Dystopian sci-fi, realistic stylized
Height: 1.75m (units)

Clothing:
- White/light gray medical uniform (roughness 0.6)
- Cyan accent strips on sleeves and collar (slight emission 0.2)
- Red cross on chest (embossed 0.5mm)
- Tactical medical vest

Equipment:
- Medical backpack (separate mesh)
  - 4-6 glowing cyan vials visible
  - Mechanical straps and buckles
- Handheld scanner device in right hand
  - Small screen with cyan glow

Materials:
- Uniform: #E8E8E8, roughness 0.6, metallic 0.0
- Accents: #00D9FF, roughness 0.3, emission 0.2
- Cross: #C13030, roughness 0.5

Poly count: 3000-4000 tris
Topology: Clean quads, prepared for rigging
Pose: T-pose or neutral standing
```

### Reference Keywords
```
medic, doctor, sci-fi medical, futuristic paramedic, white uniform, 
medical backpack, health scanner, dystopian healer, clean aesthetic
```

---

## 🔫 SOLDIER

### Prompt Completo (Text-to-3D)
```
Low poly 3D model of futuristic military soldier, wearing light tactical 
armor in olive green and black colors, combat vest with ammo pouches, 
tactical helmet with visor, holding compact futuristic assault rifle, 
knee and elbow pads, military boots, athletic build, stern expression, 
standing combat-ready pose, realistic stylized proportions 1.75 meters tall, 
dystopian sci-fi military aesthetic, game-ready 4000-5000 polygons, 
PBR materials, no background, centered, suitable for web rendering
```

### Prompt Técnico (Blender / Manual)
```
Asset: Futuristic Combat Soldier
Style: Dystopian military, tactical
Height: 1.75m

Clothing & Armor:
- Light tactical armor plates (chest, shoulders)
- Olive green (#4A5D4A) base uniform
- Black (#2B2B2B) armor plates
- Combat vest with pouches (4-6 visible)
- Tactical belt
- Military boots with ankle support

Equipment:
- Futuristic assault rifle (separate mesh, can be detached)
  - Compact bullpup design
  - Angular, aggressive aesthetic
  - Attachment point: right hand
- Tactical helmet with flip visor
  - Visor can be modeled up or down
- Knee and elbow protection pads

Materials:
- Uniform: #4A5D4A, roughness 0.7, fabric normal map
- Armor: #2B2B2B, roughness 0.5, metallic 0.1, scratches
- Weapon: metallic 0.6, roughness 0.4

Poly count: 4000-5000 tris
Weapon separate: 800-1200 tris
```

### Reference Keywords
```
tactical soldier, sci-fi military, combat armor, futuristic infantry,
assault rifle, dystopian warrior, olive green uniform, tactical vest
```

---

## 🌾 PEASANT (CAMPESINO)

### Prompt Completo (Text-to-3D)
```
Low poly 3D model of futuristic peasant farmer, wearing practical work 
clothes in earth tones, brown and beige worn clothing, carrying fabric 
satchel bag across torso, holding futuristic harvesting sickle tool, 
utility belt with pouches, rolled up sleeves, simple boots, humble 
working-class appearance, weathered and dirty clothes texture, 
standing relaxed pose, 1.75 meters tall, dystopian sci-fi survivor 
aesthetic, game-ready 2500-3500 polygons, no background, centered
```

### Prompt Técnico (Blender / Manual)
```
Asset: Dystopian Farmer/Gatherer
Style: Humble survivor, working class
Height: 1.75m

Clothing:
- Simple shirt with rolled sleeves
- Worn work pants
- Earth tone colors: brown #8B6F47, beige #C9B697
- Visible dirt and wear (texture detail)
- Simple work boots
- Fabric satchel across shoulder

Equipment:
- Futuristic harvesting tool (sickle-like)
  - Mix of traditional and tech
  - Worn metal blade
- Utility belt with small pouches
- Simple gloves (fingerless optional)

Materials:
- Clothing: roughness 0.8, fabric normals, dirt overlay
- Satchel: canvas/fabric, #8B6F47
- Tool: metallic 0.4, roughness 0.6, rust details

Weathering: Heavy dirt, patches, worn areas
Poly count: 2500-3500 tris
Expression: Tired but determined
```

### Reference Keywords
```
farmer, peasant, survivor, post-apocalyptic worker, gatherer, 
earth tones, satchel, sickle, humble clothes, dystopian civilian
```

---

## 🔧 CONSTRUCTOR

### Prompt Completo (Text-to-3D)
```
Low poly 3D model of futuristic construction worker engineer, wearing 
industrial work clothes in safety orange and yellow colors, orange hard 
hat with built-in headlamp light, tool belt with futuristic construction 
tools, welding goggles on forehead, work gloves, lightweight exoskeleton 
support frame on back, sturdy work boots, stocky build, confident pose, 
1.75 meters tall, dystopian industrial aesthetic, game-ready 3500-4500 
polygons, PBR materials with glowing headlamp, no background
```

### Prompt Técnico (Blender / Manual)
```
Asset: Futuristic Construction Engineer
Style: Industrial, heavy equipment operator
Height: 1.75m

Clothing:
- Industrial work jumpsuit or vest+pants
- Safety orange #D97629 primary color
- Yellow #E5B641 accent strips (reflective)
- Reinforced knees and elbows
- Heavy work boots with steel toes
- Work gloves (thick, protective)

Equipment:
- Hard hat with integrated headlamp
  - Bright white LED glow (emission 1.0)
- Tool belt with:
  - Futuristic welding tool
  - Mechanical wrench
  - Scanner device
- Welding goggles on forehead (up position)
- Lightweight exoskeleton frame (back)
  - Minimal, just support struts
  - Metallic, hydraulic details

Materials:
- Clothing: #D97629, roughness 0.7
- Reflective strips: #E5B641, metallic 0.8
- Headlamp: emission 1.0, white
- Tools: metallic 0.6, scratched

Poly count: 3500-4500 tris
Build: Stocky, strong physique
```

### Reference Keywords
```
construction worker, engineer, builder, hard hat, tool belt, 
safety orange, industrial worker, exoskeleton, dystopian engineer
```

---

## ⛏️ MINER

### Prompt Completo (Text-to-3D)
```
Low poly 3D model of futuristic deep space miner, wearing reinforced 
mining suit in dark gray and blue colors, mining helmet with very 
bright headlamp light, reinforced gloves and heavy boots, holding 
compact laser mining drill tool, ore collection device backpack, 
optional respirator face mask, industrial protective gear, rugged 
appearance, 1.75 meters tall, dystopian industrial mining aesthetic, 
game-ready 3500-4500 polygons, bright headlamp emission, no background
```

### Prompt Técnico (Blender / Manual)
```
Asset: Dystopian Deep Miner
Style: Heavy industrial, hazardous environment
Height: 1.75m

Clothing:
- Reinforced mining suit (coveralls style)
- Dark gray #6B7280 primary
- Navy blue #2C3E50 reinforced sections
- Padded chest, shoulders, thighs
- Heavy-duty work boots (ankle high)
- Thick protective gloves
- Optional: respirator mask (half-face)

Equipment:
- Mining helmet with ultra-bright headlamp
  - Emission 1.5, yellow-white #E8B641
  - Wide beam angle visual effect
- Compact laser drill (handheld)
  - Cylindrical design
  - Glowing power core
  - Separate mesh, attachable to belt
- Ore collection device (backpack)
  - Industrial container
  - Tubes and mechanical parts
  - Collection port visible

Materials:
- Suit: #6B7280, roughness 0.6, metallic 0.2
- Reinforcements: #2C3E50, metallic 0.4
- Headlamp: #E8B641, emission 1.5
- Drill: metallic 0.7, cyan glow 0.3

Poly count: 3500-4500 tris
Build: Sturdy, ready for hard labor
Weathering: Heavy dust, scratches, worn
```

### Reference Keywords
```
miner, mining worker, drill operator, headlamp, reinforced suit,
industrial worker, ore collector, deep space miner, hazmat suit
```

---

## 🎨 General Tips for AI Generation

### Best Results with Meshy.ai / Rodin.ai
1. **Be specific about pose:** Always specify T-pose or A-pose for rigging
2. **Mention poly count:** "game-ready low poly" or "3000-5000 polygons"
3. **Style consistency:** Always include "dystopian sci-fi" and "realistic stylized"
4. **Lighting:** Request "neutral lighting" or "studio lighting" for clean export
5. **Background:** Always specify "no background" or "plain background"

### Image-to-3D Workflow
1. Generate concept art with Midjourney/DALL-E using the text prompts above
2. Use the concept image as input to Meshy.ai or Luma AI
3. Add technical requirements in the image-to-3D prompt:
   ```
   Convert to game-ready 3D model, low poly 3000-4000 triangles,
   clean topology, T-pose, PBR materials, suitable for real-time rendering
   ```

### Post-Processing Required
Most AI-generated models will need:
- ✅ Retopology (if too high poly)
- ✅ UV unwrapping/optimization
- ✅ Material cleanup and PBR setup
- ✅ Scale adjustment (set to 1.75m height)
- ✅ Origin/pivot centering
- ✅ Export to GLB with compression

---

## 📦 Batch Generation Order

**Priority 1 (Core gameplay):**
1. Soldier
2. Doctor
3. Peasant

**Priority 2 (Full roster):**
4. Miner
5. Constructor

**Priority 3 (Variants):**
6. Wounded versions
7. Different poses
8. Equipment variations

---

## 🔗 Recommended Tools

- **Meshy.ai:** Best for text-to-3D, good topology
- **Rodin.ai:** Fast generation, needs cleanup
- **Luma AI:** Image-to-3D, photogrammetry style
- **Blender:** Manual modeling, full control
- **Mixamo:** Auto-rigging if needed (after export)



