# JORUMI - 3D Assets Quickstart
## Guía rápida para empezar

---

## 🚀 Para Artistas 3D

### 1. Lee las Especificaciones
```bash
📁 client/assets/3d/
├── 📄 README.md                    ← Empieza aquí
├── 📁 specs/                       ← Especificaciones técnicas detalladas
│   ├── characters_spec.json
│   ├── resources_spec.json
│   ├── vehicles_spec.json
│   └── dice_spec.json
└── 📁 prompts/                     ← Prompts para generación con IA
    ├── CHARACTER_PROMPTS.md
    └── RESOURCES_VEHICLES_DICE_PROMPTS.md
```

### 2. Generación con IA (Rápido)

**Opción A: Meshy.ai** (Recomendado)
1. Ve a https://www.meshy.ai
2. Usa los prompts en `/prompts/CHARACTER_PROMPTS.md`
3. Genera con "Text to 3D"
4. Descarga en formato GLB
5. Post-proceso en Blender (escala, origen)

**Opción B: Rodin.ai**
1. Ve a https://hyperhuman.deemos.com/rodin
2. Similar proceso con prompts

**Opción C: Luma AI**
1. Genera concept art con DALL-E/Midjourney
2. Usa "Image to 3D" en https://lumalabs.ai

### 3. Modelado Manual (Control Total)

**Blender Workflow:**
```
1. Nuevo proyecto
2. Escala: 1 unidad = 1 metro
3. Modela según specs (ver /specs/)
4. Texturiza (PBR workflow)
5. Exporta: File > Export > glTF 2.0 (.glb)
   ✓ Include: Selected Objects
   ✓ Transform: +Y Up
   ✓ Geometry: Apply Modifiers, UVs, Normals
   ✓ Materials: Export, Images Embedded
   ✓ Compression: ON
```

### 4. Validación

**Antes de entregar:**
```bash
1. Prueba en Three.js Editor: https://threejs.org/editor/
2. Valida en glTF Viewer: https://gltf-viewer.donmccurdy.com/
3. Verifica:
   - Escala correcta (personaje ~1.75m)
   - Origen centrado en base
   - Texturas visibles
   - Tamaño <1MB por asset
```

### 5. Entrega

**Estructura:**
```
client/assets/3d/
└── characters/
    └── doctor/
        └── char_doctor_01.glb  ← Tu archivo aquí
```

---

## 💻 Para Desarrolladores

### 1. Instalación

```bash
npm install three @react-three/fiber @react-three/drei
```

### 2. Carga Rápida (Ejemplo Mínimo)

```tsx
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

function Doctor() {
  const { scene } = useGLTF('/assets/3d/characters/doctor/char_doctor_01.glb');
  return <primitive object={scene} />;
}

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Doctor />
    </Canvas>
  );
}
```

### 3. Integración Completa

**Lee estos archivos en orden:**
```bash
1. 📄 INTEGRATION_GUIDE.md          ← Guía completa Three.js
2. 📄 examples/GameBoard.example.tsx ← Escena completa
3. 📄 examples/Character.component.tsx ← Componente con estados
4. 📄 examples/AssetLoader.utility.ts ← Sistema de carga
```

### 4. Asset Loader (Recomendado)

```tsx
import { getAssetLoader } from './examples/AssetLoader.utility';

// En el componente principal
useEffect(() => {
  const loader = getAssetLoader();
  loader.preloadPriority(); // Carga assets prioritarios
}, []);
```

### 5. Usar Componentes Listos

```tsx
import { Character } from './examples/Character.component';
import { CharacterType } from '../engine/domain/types';

<Character
  type={CharacterType.DOCTOR}
  position={[0, 0, 0]}
  isSelected={true}
  onClick={() => console.log('Clicked!')}
  showNameTag
  name="Dr. Smith"
/>
```

---

## 🎯 Por Dónde Empezar

### Si eres Artista 3D:
1. **Lee:** `README.md`
2. **Revisa:** `/specs/characters_spec.json`
3. **Usa prompts:** `/prompts/CHARACTER_PROMPTS.md`
4. **Genera:** Doctor, Soldado, Campesino (prioridad 1)
5. **Valida:** Three.js Editor

### Si eres Desarrollador:
1. **Lee:** `INTEGRATION_GUIDE.md`
2. **Instala:** Three.js, R3F, Drei
3. **Prueba:** `examples/GameBoard.example.tsx`
4. **Implementa:** `AssetLoader.utility.ts`
5. **Integra:** Con el motor de juego existente

### Si coordinas el proyecto:
1. **Revisa:** `ASSET_INVENTORY.md` (lista completa)
2. **Planifica:** Fase 1: 5 personajes + 4 recursos + 3 dados
3. **Asigna:** Usa los prompts para IA o encarga a artista
4. **Valida:** Checklist de calidad en cada asset
5. **Integra:** Desarrolladores implementan componentes

---

## 📋 Checklist Rápido

### Para Artistas (Por Asset)
- [ ] Leo las especificaciones del asset
- [ ] Genero/modelo según specs
- [ ] Verifico escala (1 unit = 1m)
- [ ] Centro origen en la base
- [ ] Exporto a GLB con texturas embebidas
- [ ] Pruebo en Three.js Editor
- [ ] Verifico tamaño de archivo (<1MB)
- [ ] Coloco en carpeta correcta

### Para Desarrolladores (Por Feature)
- [ ] Instalo dependencias (Three.js, R3F)
- [ ] Implemento AssetLoader
- [ ] Creo componente para el asset
- [ ] Añado estados visuales (hover, selected)
- [ ] Integro con motor de juego
- [ ] Añado animaciones si necesario
- [ ] Optimizo (instancing, LOD)
- [ ] Pruebo rendimiento (60 FPS)

---

## 🔥 Tips Pro

### Artistas:
- **Usa templates:** Crea un personaje base, luego variantes
- **Reutiliza texturas:** Paleta de colores compartida
- **Itera rápido:** IA primero, refina manualmente después
- **Comprime:** GLB compression ahorra 40-60% de tamaño

### Desarrolladores:
- **Preload inteligente:** Solo assets de prioridad 1 al inicio
- **Lazy load:** Resto de assets bajo demanda
- **Instancing:** Para objetos repetidos (recursos)
- **LOD:** Para objetos grandes (nave nodriza)
- **React.memo:** Evita re-renders innecesarios

---

## 🆘 Solución de Problemas

### "No veo el modelo"
```tsx
// Debug rápido
const { scene } = useGLTF('/path/to/model.glb');
console.log('Loaded:', scene);
console.log('Children:', scene.children);
console.log('BoundingBox:', new THREE.Box3().setFromObject(scene));
```

### "Modelo muy grande/pequeño"
```tsx
// Ajusta escala temporalmente
<primitive object={scene} scale={10} /> // o scale={0.1}
// Luego corrige en Blender
```

### "Texturas negras"
- Verifica que GLB tiene texturas embebidas
- Comprueba materiales en Three.js Editor
- Asegura que usas PBR materials

### "Bajo FPS"
```tsx
// 1. Usa Stats.js
import Stats from 'stats.js';

// 2. Revisa polígonos
console.log(renderer.info);

// 3. Reduce draw calls con instancing
// 4. Implementa LOD
```

---

## 📚 Recursos Externos

### Herramientas Recomendadas
- **Blender:** https://www.blender.org/ (Gratis)
- **Meshy.ai:** https://www.meshy.ai (IA, freemium)
- **Three.js Editor:** https://threejs.org/editor/ (Validación)
- **glTF Viewer:** https://gltf-viewer.donmccurdy.com/ (Validación)

### Tutoriales
- Three.js Docs: https://threejs.org/docs/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/
- Blender to glTF: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html

---

## 🎬 Empezar AHORA

### Artista: Primera tarea (30 min)
```
1. Abre Meshy.ai
2. Copia prompt del Doctor desde CHARACTER_PROMPTS.md
3. Genera modelo
4. Descarga GLB
5. Abre en Three.js Editor
6. Verifica que se ve bien
7. ¡Listo! Tienes tu primer asset
```

### Desarrollador: Primera tarea (30 min)
```bash
1. npm install three @react-three/fiber @react-three/drei
2. Copia GameBoard.example.tsx a tu proyecto
3. Importa y renderiza
4. Cambia la cámara y experimenta
5. Añade tu primer personaje con Character component
6. ¡Listo! Tienes tu escena 3D funcionando
```

---

**¿Dudas?** Revisa los archivos de documentación detallada:
- Technical: `README.md`
- Integration: `INTEGRATION_GUIDE.md`
- Inventory: `ASSET_INVENTORY.md`
- Specs: `/specs/*.json`


