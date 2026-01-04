# JORUMI - Three.js Integration Guide
## Guía completa para integrar assets 3D en la aplicación web

---

## 📋 Tabla de Contenidos

1. [Setup Inicial](#setup-inicial)
2. [Carga de Assets](#carga-de-assets)
3. [React Three Fiber](#react-three-fiber)
4. [Optimización](#optimización)
5. [Animaciones](#animaciones)
6. [Iluminación y Escena](#iluminación-y-escena)
7. [Troubleshooting](#troubleshooting)

---

## Setup Inicial

### Instalación de Dependencias

```bash
# Core dependencies
npm install three @react-three/fiber @react-three/drei

# Optional but recommended
npm install @react-three/postprocessing leva
npm install --save-dev @types/three
```

### Estructura de Proyecto Recomendada

```
client/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── Character.tsx
│   │   │   ├── Resource.tsx
│   │   │   └── Vehicle.tsx
│   │   ├── three/
│   │   │   ├── Scene.tsx
│   │   │   ├── Lights.tsx
│   │   │   ├── Camera.tsx
│   │   │   └── Effects.tsx
│   │   └── dice/
│   │       └── DiceRoller.tsx
│   ├── hooks/
│   │   ├── useGLTF.ts
│   │   └── useAssetLoader.ts
│   └── utils/
│       └── three-helpers.ts
└── assets/
    └── 3d/
        ├── characters/
        ├── resources/
        ├── vehicles/
        └── dice/
```

---

## Carga de Assets

### Método 1: Three.js Puro (GLTFLoader)

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

// Carga básica
loader.load(
  '/assets/3d/characters/doctor/char_doctor_01.glb',
  (gltf) => {
    const model = gltf.scene;
    
    // Configurar escala (ya debe estar correcta)
    model.scale.set(1, 1, 1);
    
    // Posicionar
    model.position.set(0, 0, 0);
    
    // Añadir a la escena
    scene.add(model);
    
    console.log('Modelo cargado:', gltf);
  },
  (progress) => {
    console.log('Cargando...', (progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('Error al cargar:', error);
  }
);
```

### Método 2: Preload Manager

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class AssetManager {
  private loader: GLTFLoader;
  private loadingManager: THREE.LoadingManager;
  private cache: Map<string, any> = new Map();
  
  constructor() {
    this.loadingManager = new THREE.LoadingManager(
      () => console.log('Todos los assets cargados'),
      (url, loaded, total) => {
        console.log(`Cargando: ${url} (${loaded}/${total})`);
      },
      (url) => console.error(`Error cargando: ${url}`)
    );
    
    this.loader = new GLTFLoader(this.loadingManager);
  }
  
  async load(path: string): Promise<any> {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.cache.set(path, gltf);
          resolve(gltf);
        },
        undefined,
        reject
      );
    });
  }
  
  preloadAll(paths: string[]): Promise<any[]> {
    return Promise.all(paths.map(path => this.load(path)));
  }
}

// Uso
const assetManager = new AssetManager();

const characterPaths = [
  '/assets/3d/characters/doctor/char_doctor_01.glb',
  '/assets/3d/characters/soldier/char_soldier_01.glb',
  '/assets/3d/characters/peasant/char_peasant_01.glb',
  '/assets/3d/characters/constructor/char_constructor_01.glb',
  '/assets/3d/characters/miner/char_miner_01.glb',
];

await assetManager.preloadAll(characterPaths);
```

---

## React Three Fiber

### Setup Básico de la Escena

```tsx
// Scene.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export function GameScene() {
  return (
    <Canvas
      camera={{ 
        position: [10, 10, 10], 
        fov: 50,
        near: 0.1,
        far: 1000 
      }}
      shadows
      gl={{ 
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* Game content */}
      <GameBoard />
      
      {/* Environment */}
      <Environment preset="city" />
    </Canvas>
  );
}
```

### Componente Character

```tsx
// Character.tsx
import { useGLTF } from '@react-three/drei';
import { CharacterType } from '../../../engine/domain/types';

interface CharacterProps {
  type: CharacterType;
  position: [number, number, number];
  rotation?: [number, number, number];
  isWounded?: boolean;
}

const CHARACTER_PATHS: Record<CharacterType, string> = {
  [CharacterType.DOCTOR]: '/assets/3d/characters/doctor/char_doctor_01.glb',
  [CharacterType.SOLDIER]: '/assets/3d/characters/soldier/char_soldier_01.glb',
  [CharacterType.PEASANT]: '/assets/3d/characters/peasant/char_peasant_01.glb',
  [CharacterType.CONSTRUCTOR]: '/assets/3d/characters/constructor/char_constructor_01.glb',
  [CharacterType.MINER]: '/assets/3d/characters/miner/char_miner_01.glb',
};

export function Character({ type, position, rotation = [0, 0, 0], isWounded = false }: CharacterProps) {
  const { scene } = useGLTF(CHARACTER_PATHS[type]);
  
  // Clone the scene para permitir múltiples instancias
  const clonedScene = scene.clone();
  
  return (
    <primitive 
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={1}
      castShadow
      receiveShadow
    />
  );
}

// Preload todos los personajes al inicio
Object.values(CHARACTER_PATHS).forEach(path => {
  useGLTF.preload(path);
});
```

### Componente Resource

```tsx
// Resource.tsx
import { useGLTF } from '@react-three/drei';
import { ResourceType } from '../../../engine/domain/types';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ResourceProps {
  type: ResourceType;
  position: [number, number, number];
  quantity?: number;
  animate?: boolean;
}

const RESOURCE_PATHS: Record<ResourceType, string> = {
  [ResourceType.FOOD]: '/assets/3d/resources/food/res_food_crate_01.glb',
  [ResourceType.MEDICINE]: '/assets/3d/resources/medicine/res_medicine_case_01.glb',
  [ResourceType.METAL]: '/assets/3d/resources/metal/res_metal_ingot_01.glb',
  [ResourceType.MINERALS]: '/assets/3d/resources/minerals/res_mineral_crystal_01.glb',
};

export function Resource({ type, position, quantity = 1, animate = false }: ResourceProps) {
  const { scene } = useGLTF(RESOURCE_PATHS[type]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Animación de rotación suave para minerales
  useFrame((state) => {
    if (animate && groupRef.current && type === ResourceType.MINERALS) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: Math.min(quantity, 3) }).map((_, i) => (
        <primitive
          key={i}
          object={scene.clone()}
          position={[0, i * 0.05, 0]}
          scale={1}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

// Preload
Object.values(RESOURCE_PATHS).forEach(path => {
  useGLTF.preload(path);
});
```

### Componente Mothership

```tsx
// Mothership.tsx
import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MothershipProps {
  position: [number, number, number];
  health: number;
  maxHealth: number;
}

export function Mothership({ position, health, maxHealth }: MothershipProps) {
  const { scene, materials } = useGLTF('/assets/3d/vehicles/mothership/veh_mothership_01.glb');
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  // Animación de hover y pulse
  useFrame((state) => {
    if (groupRef.current) {
      // Hover suave
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      
      // Rotación lenta
      groupRef.current.rotation.y += 0.001;
    }
    
    // Pulse del core
    if (coreRef.current && materials['MAT_Mothership_Core']) {
      const pulseIntensity = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      (materials['MAT_Mothership_Core'] as any).emissiveIntensity = pulseIntensity;
    }
  });
  
  // Cambiar color basado en salud
  const healthPercent = health / maxHealth;
  const damaged = healthPercent < 0.5;
  
  return (
    <group ref={groupRef} position={position}>
      <primitive
        object={scene.clone()}
        scale={1}
        castShadow
        receiveShadow
      />
      
      {/* Partículas de daño si está dañada */}
      {damaged && (
        <pointLight
          position={[0, 0, 0]}
          intensity={2}
          color="#ff4444"
          distance={5}
        />
      )}
    </group>
  );
}

useGLTF.preload('/assets/3d/vehicles/mothership/veh_mothership_01.glb');
```

---

## Optimización

### 1. Instanced Meshes (para múltiples copias)

```tsx
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

function InstancedResources({ positions }: { positions: THREE.Vector3[] }) {
  const { scene } = useGLTF('/assets/3d/resources/food/res_food_crate_01.glb');
  
  const instances = useMemo(() => {
    const temp = new THREE.Object3D();
    const mesh = scene.children[0] as THREE.Mesh;
    const instancedMesh = new THREE.InstancedMesh(
      mesh.geometry,
      mesh.material,
      positions.length
    );
    
    positions.forEach((pos, i) => {
      temp.position.copy(pos);
      temp.updateMatrix();
      instancedMesh.setMatrixAt(i, temp.matrix);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }, [scene, positions]);
  
  return <primitive object={instances} />;
}
```

### 2. LOD (Level of Detail)

```tsx
import { useGLTF } from '@react-three/drei';
import { LOD } from 'three';
import { useMemo } from 'react';

function MothershipLOD({ position }: { position: [number, number, number] }) {
  const lod0 = useGLTF('/assets/3d/vehicles/mothership/veh_mothership_lod0.glb');
  const lod1 = useGLTF('/assets/3d/vehicles/mothership/veh_mothership_lod1.glb');
  const lod2 = useGLTF('/assets/3d/vehicles/mothership/veh_mothership_lod2.glb');
  
  const lodObject = useMemo(() => {
    const lod = new LOD();
    lod.addLevel(lod0.scene.clone(), 0);    // 0-20 metros
    lod.addLevel(lod1.scene.clone(), 20);   // 20-50 metros
    lod.addLevel(lod2.scene.clone(), 50);   // 50+ metros
    return lod;
  }, [lod0, lod1, lod2]);
  
  return <primitive object={lodObject} position={position} />;
}
```

### 3. Lazy Loading con Suspense

```tsx
import { Suspense } from 'react';
import { Html, useProgress } from '@react-three/drei';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: 'white', fontSize: '24px' }}>
        Cargando... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

export function GameScene() {
  return (
    <Canvas>
      <Suspense fallback={<Loader />}>
        <GameBoard />
        <Mothership position={[0, 5, 0]} health={100} maxHealth={100} />
      </Suspense>
    </Canvas>
  );
}
```

---

## Animaciones

### Dice Roll Animation

```tsx
import { useGLTF } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DiceRoller({ onResult }: { onResult: (value: number) => void }) {
  const { scene } = useGLTF('/assets/3d/dice/dice_human_d6.glb');
  const diceRef = useRef<THREE.Group>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [angularVelocity, setAngularVelocity] = useState<THREE.Euler>(new THREE.Euler());
  const [velocity, setVelocity] = useState<THREE.Vector3>(new THREE.Vector3());
  
  const roll = () => {
    setIsRolling(true);
    
    // Velocidad angular aleatoria
    setAngularVelocity(new THREE.Euler(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5
    ));
    
    // Velocidad inicial
    setVelocity(new THREE.Vector3(
      Math.random() * 2 - 1,
      3,
      Math.random() * 2 - 1
    ));
    
    // Resultado después de 2 segundos
    setTimeout(() => {
      setIsRolling(false);
      const result = Math.floor(Math.random() * 6) + 1;
      onResult(result);
    }, 2000);
  };
  
  useFrame((state, delta) => {
    if (isRolling && diceRef.current) {
      // Aplicar rotación
      diceRef.current.rotation.x += angularVelocity.x * delta;
      diceRef.current.rotation.y += angularVelocity.y * delta;
      diceRef.current.rotation.z += angularVelocity.z * delta;
      
      // Aplicar gravedad y movimiento
      velocity.y -= 9.8 * delta; // gravedad
      diceRef.current.position.add(velocity.clone().multiplyScalar(delta));
      
      // Bounce
      if (diceRef.current.position.y < 0) {
        diceRef.current.position.y = 0;
        velocity.y *= -0.5; // coeficiente de restitución
        
        // Decay angular velocity
        angularVelocity.x *= 0.9;
        angularVelocity.y *= 0.9;
        angularVelocity.z *= 0.9;
      }
      
      // Fricción
      velocity.x *= 0.98;
      velocity.z *= 0.98;
    }
  });
  
  return (
    <group onClick={roll}>
      <group ref={diceRef} position={[0, 1, 0]}>
        <primitive object={scene.clone()} />
      </group>
    </group>
  );
}
```

---

## Iluminación y Escena

### Setup de Iluminación Óptima

```tsx
export function Lighting() {
  return (
    <>
      {/* Luz ambiente base */}
      <ambientLight intensity={0.3} color="#b0c4de" />
      
      {/* Luz direccional principal (sol) */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
      
      {/* Fill light (suaviza sombras) */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#8090b0"
      />
      
      {/* Rim light (destaca siluetas) */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.4}
        color="#4a5d8a"
      />
      
      {/* Hemisphere light (simula cielo) */}
      <hemisphereLight
        color="#87CEEB"
        groundColor="#2C3E50"
        intensity={0.4}
      />
    </>
  );
}
```

---

## Troubleshooting

### Problema: Modelo no se ve

**Soluciones:**
```typescript
// 1. Verificar escala
console.log('Scale:', model.scale);
model.scale.set(1, 1, 1);

// 2. Verificar posición
console.log('Position:', model.position);

// 3. Verificar bounding box
const box = new THREE.Box3().setFromObject(model);
console.log('Bounding box:', box);

// 4. Verificar materiales
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    console.log('Material:', child.material);
    child.material.needsUpdate = true;
  }
});
```

### Problema: Texturas no cargan

```typescript
// Asegurar que las texturas están embebidas en GLB
// O cargar manualmente:
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/path/to/texture.png');
material.map = texture;
material.needsUpdate = true;
```

### Problema: Performance bajo

```typescript
// 1. Usar instanced meshes para objetos repetidos
// 2. Implementar LOD
// 3. Reducir shadow map size
// 4. Usar frustum culling
// 5. Limitar draw calls

// Debug performance
console.log('Render info:', renderer.info);
```

---

## 📚 Referencias

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Components](https://github.com/pmndrs/drei)
- [glTF Specification](https://www.khronos.org/gltf/)




