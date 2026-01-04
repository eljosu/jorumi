# JORUMI - Assets 3D
## Guía Técnica para Artistas 3D y Desarrolladores

### 📋 Índice
1. [Especificaciones Técnicas Generales](#especificaciones-técnicas-generales)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
4. [Integración con Three.js](#integración-con-threejs)
5. [Pipeline de Producción](#pipeline-de-producción)

---

## Especificaciones Técnicas Generales

### Formato de Exportación
- **Formato primario:** GLB (glTF 2.0 Binary)
- **Alternativo:** GLTF + texturas separadas (para debugging)

### Escala y Unidades
- **1 unidad = 1 metro** en el mundo real
- Altura humana estándar: **1.75 unidades**
- Todos los objetos deben tener el origen centrado en la base (excepto donde se indique)

### Presupuesto de Polígonos (targets web)
- **Personajes:** 2,000 - 5,000 tris
- **Recursos (props pequeños):** 200 - 800 tris
- **Vehículos:** 3,000 - 8,000 tris
- **Nave nodriza:** 8,000 - 15,000 tris
- **Dados:** 500 - 1,500 tris

### Texturas
- **Resolución máxima:** 2048x2048 (personajes principales), 1024x1024 (props)
- **Formato:** PNG (con transparencia) o JPG (opacos)
- **Canales PBR:**
  - BaseColor / Albedo (RGB)
  - Normal Map (RGB) - opcional pero recomendado
  - MetallicRoughness (packed: B=Metallic, G=Roughness)
  - AO (Ambient Occlusion) - opcional, puede bakearse en BaseColor

### Materiales
- **Nomenclatura:** `MAT_AssetName_MaterialName` (ej: `MAT_Doctor_Uniform`)
- Configurar roughness y metallic apropiadamente
- Evitar transparencias complejas (impactan performance)

### Jerarquía y Pivotes
- Origen del objeto en la base (contacto con el suelo)
- Personajes: pivot en el centro de los pies
- Dados: pivot en el centro geométrico
- Vehículos: pivot en el centro de la base

---

## Estructura de Carpetas

```
client/assets/3d/
├── characters/          # Personajes humanos
│   ├── base/           # Modelo base compartido
│   ├── doctor/
│   ├── soldier/
│   ├── peasant/
│   ├── constructor/
│   └── miner/
├── resources/          # Recursos del juego
│   ├── food/
│   ├── medicine/
│   ├── metal/
│   └── minerals/
├── vehicles/           # Vehículos y elementos grandes
│   ├── transport_boat/
│   ├── mothership/
│   └── floating_platform/
├── dice/               # Dados personalizados
│   ├── alien_attack/
│   ├── alien_action/
│   ├── human_d6/
│   ├── human_2d3/
│   └── combat/
├── buildings/          # Edificios (futuro)
│   ├── bunker/
│   ├── hospital/
│   ├── workshop/
│   └── beacon/
├── tiles/              # Losetas del mapa (futuro)
│   ├── ghetto/
│   ├── forest/
│   ├── mine/
│   ├── ruins/
│   └── wasteland/
├── specs/              # Especificaciones técnicas JSON
└── prompts/            # Prompts para generación con IA
```

---

## Convenciones de Nomenclatura

### Archivos GLB
Formato: `{category}_{name}_{variant?}.glb`

Ejemplos:
- `char_doctor_01.glb`
- `char_soldier_wounded.glb`
- `res_food_crate_01.glb`
- `veh_mothership.glb`
- `dice_alien_attack.glb`

### Nombres de Mallas (Meshes)
Formato: `{AssetName}_{MeshName}`

Ejemplos:
- `Doctor_Body`
- `Doctor_Equipment`
- `Mothership_Hull`
- `Dice_Face_01`

### Nombres de Materiales
Formato: `MAT_{AssetName}_{MaterialPurpose}`

Ejemplos:
- `MAT_Doctor_Uniform`
- `MAT_Soldier_Armor`
- `MAT_Mothership_Metal`

---

## Integración con Three.js

### Carga Básica

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

loader.load(
  '/assets/3d/characters/doctor/char_doctor_01.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1); // Ya está en escala correcta
    model.position.set(0, 0, 0);
    scene.add(model);
  }
);
```

### Con React Three Fiber

```typescript
import { useGLTF } from '@react-three/drei';

function Doctor() {
  const { scene } = useGLTF('/assets/3d/characters/doctor/char_doctor_01.glb');
  return <primitive object={scene} />;
}
```

### Optimización

```typescript
import { useGLTF } from '@react-three/drei';

// Precargar assets
useGLTF.preload('/assets/3d/characters/doctor/char_doctor_01.glb');

// Compartir geometrías instanciadas
function DoctorInstanced({ position }) {
  const { scene } = useGLTF('/assets/3d/characters/doctor/char_doctor_01.glb');
  return <primitive object={scene.clone()} position={position} />;
}
```

---

## Pipeline de Producción

### 1. Modelado (Blender recomendado)
- Comenzar desde las especificaciones en `specs/`
- Seguir el presupuesto de polígonos
- Mantener topología limpia (quads cuando sea posible)

### 2. UV Mapping
- UVs sin overlapping (excepto elementos simétricos)
- Aprovechar espacio de textura eficientemente
- Padding de ~4px entre islas UV

### 3. Texturizado
- Software recomendado: Substance Painter, Quixel, Blender
- Seguir flujo PBR
- Bake AO, Curvature, Position si es necesario

### 4. Exportación desde Blender
```
File > Export > glTF 2.0 (.glb/.gltf)

Configuración recomendada:
✓ Include: Selected Objects
✓ Transform: +Y Up
✓ Geometry: Apply Modifiers
✓ Geometry: UVs
✓ Geometry: Normals
✓ Geometry: Vertex Colors (si se usan)
✓ Materials: Export
✓ Compression: ON (reduce tamaño ~50%)
✓ Draco: OFF (mejor compatibilidad, menos procesamiento cliente)
```

### 5. Validación
- Probar en Three.js Editor: https://threejs.org/editor/
- Verificar en glTF Viewer: https://gltf-viewer.donmccurdy.com/
- Comprobar tamaño de archivo (idealmente <500KB por asset simple)

### 6. Optimización Post-Export
Herramientas:
- **gltf-pipeline:** `gltf-pipeline -i model.glb -o model-optimized.glb -d`
- **gltfpack:** Compresión agresiva para web

---

## Estilo Visual - Referencias

### Paleta de Colores

**Humanos (tonos cálidos, funcionales):**
- Doctor: Blanco #E8E8E8, Cruz roja #C13030
- Soldado: Verde oliva #4A5D4A, Negro #2B2B2B
- Campesino: Marrón tierra #8B6F47, Beige #C9B697
- Constructor: Naranja seguridad #D97629, Amarillo #E5B641
- Minero: Gris metálico #6B7280, Azul oscuro #2C3E50

**Alienígenas (tonos fríos, orgánico-tecnológicos):**
- Nave: Púrpura oscuro #4A235A, Negro azulado #0D1B2A
- Detalles bioluminiscentes: Cyan #00D9FF, Verde ácido #39FF14

**Recursos:**
- Comida: Colores naturales (verde, marrón)
- Medicina: Blanco clínico + azul
- Metal: Plateado/gris industrial
- Minerales: Cristales con tonos cyan/púrpura

---

## Herramientas Recomendadas

### Modelado 3D
- **Blender** (gratis, open source) - RECOMENDADO
- Maya / 3ds Max (industria)

### Texturizado
- **Substance 3D Painter** (estándar industria)
- Quixel Mixer (gratis)
- Blender (shader nodes + baking)

### Generación con IA
- **Meshy.ai** - Text/Image to 3D
- **Rodin.ai** - Generación rápida
- **Luma AI** - 3D desde fotos
- **CSM.ai** - Cube-based generator

### Validación
- Three.js Editor: https://threejs.org/editor/
- glTF Viewer: https://gltf-viewer.donmccurdy.com/
- Babylon Sandbox: https://sandbox.babylonjs.com/

---

## Checklist Pre-Entrega

- [ ] Formato GLB con todas las texturas embebidas
- [ ] Escala correcta (1 unidad = 1 metro)
- [ ] Origen/pivot correctamente posicionado
- [ ] Nombres de mallas y materiales claros
- [ ] Presupuesto de polígonos respetado
- [ ] Texturas optimizadas (potencias de 2)
- [ ] Probado en Three.js Editor
- [ ] Tamaño de archivo razonable (<1MB por asset)
- [ ] Sin errores de validación glTF

---

## Soporte

Para dudas técnicas o revisión de assets:
- Ver especificaciones detalladas en `/specs/`
- Ver prompts de generación en `/prompts/`
- Consultar ejemplos de código en `/examples/`

**Versión:** 1.0  
**Última actualización:** Enero 2026



