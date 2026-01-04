# JORUMI - Guía de Extensión

> Cómo agregar nuevas acciones, componentes y funcionalidades manteniendo la arquitectura limpia

---

## 🎯 Agregar Nueva Acción del Juego

### Ejemplo: Implementar "Construir Hospital"

#### Paso 1: Verificar que la acción existe en el motor

```typescript
// engine/actions/types.ts
export interface BuildStructureAction extends BaseAction {
  type: ActionType.BUILD_STRUCTURE;
  characterId: CharacterId;
  ghettoId: GhettoId;
  buildingType: BuildingType; // HOSPITAL
}
```

✅ Ya existe en el motor

#### Paso 2: NO duplicar lógica en la UI

```typescript
// ❌ NUNCA hacer esto en la UI:
const canBuildHospital = (ghetto: Ghetto) => {
  // NO duplicar estas validaciones aquí
  if (ghetto.resources.METAL < 3) return false;
  if (ghetto.resources.MEDICINE < 2) return false;
  if (ghetto.buildings.includes(BuildingType.HOSPITAL)) return false;
  return true;
};
```

```typescript
// ✅ Hacer esto:
const canBuildHospital = (ghetto: Ghetto) => {
  const action = {
    type: ActionType.BUILD_STRUCTURE,
    ghettoId: ghetto.id,
    buildingType: BuildingType.HOSPITAL,
    characterId: selectedCharacter.id,
    playerId: gameState.currentPlayerId,
    timestamp: Date.now(),
  };
  
  // Preguntar al motor
  const validation = validateAction(action);
  return validation.valid;
};
```

#### Paso 3: Crear componente UI para la acción

```typescript
// components/ui/BuildingPanel.tsx

import { useGameStore } from '@/store/game-store';
import { ActionType, BuildingType, BUILDING_COSTS } from '@engine/index';

export function BuildingPanel() {
  const gameState = useGameStore(state => state.gameState);
  const selectedGhetto = useGameStore(state => state.uiState.selectedGhettoId);
  const selectedCharacter = useGameStore(state => state.uiState.selectedCharacterId);
  const dispatchAction = useGameStore(state => state.dispatchAction);
  const validateAction = useGameStore(state => state.validateAction);
  
  if (!gameState || !selectedGhetto || !selectedCharacter) return null;
  
  const ghetto = gameState.ghettos.get(selectedGhetto);
  const character = gameState.characters.get(selectedCharacter);
  
  if (!ghetto || !character) return null;
  
  // Crear acción
  const buildHospitalAction = {
    type: ActionType.BUILD_STRUCTURE,
    playerId: gameState.currentPlayerId,
    characterId: character.id,
    ghettoId: ghetto.id,
    buildingType: BuildingType.HOSPITAL,
    timestamp: Date.now(),
  };
  
  // Validar con el motor
  const validation = validateAction(buildHospitalAction);
  
  // Handler
  const handleBuildHospital = () => {
    const result = dispatchAction(buildHospitalAction);
    
    if (result.success) {
      // Motor ya aplicó el cambio
      // Events procesados automáticamente por el store
    }
  };
  
  return (
    <div className="building-panel">
      <h3>Build Hospital</h3>
      
      {/* Mostrar costos (del motor, no duplicados) */}
      <div>
        <p>Cost:</p>
        <ul>
          <li>Metal: {BUILDING_COSTS[BuildingType.HOSPITAL].METAL}</li>
          <li>Medicine: {BUILDING_COSTS[BuildingType.HOSPITAL].MEDICINE}</li>
        </ul>
      </div>
      
      {/* Botón con validación */}
      <button
        onClick={handleBuildHospital}
        disabled={!validation.valid}
        title={!validation.valid ? validation.reason : ''}
      >
        Build Hospital
      </button>
      
      {/* Mostrar razón si no es válido */}
      {!validation.valid && (
        <p className="text-red-500 text-sm">{validation.reason}</p>
      )}
    </div>
  );
}
```

#### Paso 4: Agregar representación visual 3D (opcional)

```typescript
// components/scene/Building.tsx

import { useGLTF } from '@react-three/drei';
import { BuildingType } from '@engine/domain/types';
import { hexToWorld } from '@/utils/coordinate-converter';

interface BuildingProps {
  buildingType: BuildingType;
  tileCoordinates: HexCoordinates;
}

const BUILDING_MODELS = {
  [BuildingType.HOSPITAL]: '/assets/3d/buildings/hospital.glb',
  [BuildingType.WORKSHOP]: '/assets/3d/buildings/workshop.glb',
  [BuildingType.BUNKER]: '/assets/3d/buildings/bunker.glb',
  [BuildingType.BEACON]: '/assets/3d/buildings/beacon.glb',
};

export function Building({ buildingType, tileCoordinates }: BuildingProps) {
  const { scene } = useGLTF(BUILDING_MODELS[buildingType]);
  const position = hexToWorld(tileCoordinates, 0.3);
  
  return (
    <primitive
      object={scene.clone()}
      position={[position.x, position.y, position.z]}
      scale={1}
      castShadow
      receiveShadow
    />
  );
}

// Preload
Object.values(BUILDING_MODELS).forEach(path => {
  useGLTF.preload(path);
});
```

#### Paso 5: Integrar en GameBoard

```typescript
// components/scene/GameBoard.tsx

export function GameBoard() {
  const gameState = useGameStore(selectGameState);
  
  if (!gameState) return null;
  
  const tiles = Array.from(gameState.tiles.values());
  const ghettos = Array.from(gameState.ghettos.values());
  
  return (
    <group>
      {/* Losetas */}
      {tiles.map(tile => (
        <HexTile key={tile.id} tile={tile} />
      ))}
      
      {/* Edificios */}
      {ghettos.map(ghetto => {
        const tile = gameState.tiles.get(ghetto.tileId);
        if (!tile) return null;
        
        return ghetto.buildings.map((building, index) => (
          <Building
            key={`${ghetto.id}-${building}-${index}`}
            buildingType={building}
            tileCoordinates={tile.coordinates}
          />
        ));
      })}
      
      {/* ... resto */}
    </group>
  );
}
```

#### Paso 6: Procesar eventos (opcional)

```typescript
// store/game-store.ts

_handleEvents: (events) => {
  events.forEach(event => {
    switch (event.type) {
      case GameEventType.BUILDING_CONSTRUCTED:
        showNotification(
          `${event.data.buildingType} constructed in ${event.data.ghettoName}!`
        );
        // Disparar animación de construcción
        playSound('build-complete.mp3');
        break;
      
      // ... otros eventos
    }
  });
}
```

### Resultado Final

**Flujo completo:**
1. Usuario clickea "Build Hospital"
2. UI valida con motor (botón deshabilitado si no es válido)
3. Usuario confirma → `dispatchAction(buildHospitalAction)`
4. Store envía acción al motor
5. Motor:
   - Valida fase, recursos, constructor, etc.
   - Deduce recursos del ghetto
   - Agrega hospital a ghetto.buildings
   - Retorna nuevo estado + evento
6. Store actualiza gameState
7. React re-renderiza:
   - BuildingPanel muestra recursos actualizados
   - GameBoard renderiza nuevo edificio 3D
8. Notificación: "Hospital constructed!"

---

## 🎨 Agregar Nuevo Tipo Visual

### Ejemplo: Implementar visualización de recursos en losetas

#### Paso 1: Crear componente

```typescript
// components/scene/ResourceIcon.tsx

import { useGLTF } from '@react-three/drei';
import { ResourceType } from '@engine/domain/types';
import { useState } from 'react';
import { useFrame } from '@react-three/fiber';

interface ResourceIconProps {
  resourceType: ResourceType;
  position: [number, number, number];
  amount: number;
}

const RESOURCE_MODELS = {
  [ResourceType.FOOD]: '/assets/3d/resources/food/res_food_crate_01.glb',
  [ResourceType.MEDICINE]: '/assets/3d/resources/medicine/res_medicine_case_01.glb',
  [ResourceType.METAL]: '/assets/3d/resources/metal/res_metal_ingot_01.glb',
  [ResourceType.MINERALS]: '/assets/3d/resources/minerals/res_mineral_crystal_01.glb',
};

export function ResourceIcon({ resourceType, position, amount }: ResourceIconProps) {
  const { scene } = useGLTF(RESOURCE_MODELS[resourceType]);
  const [hovered, setHovered] = useState(false);
  
  // Animación de float
  useFrame((state) => {
    // Flotar suavemente
  });
  
  return (
    <group position={position}>
      <primitive
        object={scene.clone()}
        scale={0.3}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
      
      {/* Cantidad */}
      {hovered && (
        <Html>
          <div className="bg-black text-white px-2 py-1 rounded">
            {amount}x {resourceType}
          </div>
        </Html>
      )}
    </group>
  );
}
```

#### Paso 2: Integrar en HexTile

```typescript
// components/scene/HexTile.tsx

export function HexTile({ tile }: HexTileProps) {
  const position = hexToWorld(tile.coordinates, 0);
  
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Hexágono base */}
      <mesh>
        {/* ... */}
      </mesh>
      
      {/* Recursos disponibles en la loseta */}
      {tile.resources && (
        <group position={[0, 0.3, 0]}>
          {Object.entries(tile.resources).map(([type, amount], index) => (
            amount > 0 && (
              <ResourceIcon
                key={type}
                resourceType={type as ResourceType}
                position={[0.3 * index, 0, 0]}
                amount={amount}
              />
            )
          ))}
        </group>
      )}
    </group>
  );
}
```

---

## 🎲 Agregar Nueva Mecánica de Dado

### Ejemplo: Implementar dado de acción alienígena

#### Paso 1: Verificar que el motor lo soporta

```typescript
// engine/dice/dice.ts
export class AlienActionDice extends Dice<AlienActionFace> {
  // Ya implementado
}
```

✅ El motor ya tiene el dado

#### Paso 2: Crear componente visual

```typescript
// components/dice/AlienDiceRoller.tsx

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { AlienActionFace } from '@engine/domain/types';

interface AlienDiceRollerProps {
  onRollComplete: (result: AlienActionFace) => void;
}

export function AlienDiceRoller({ onRollComplete }: AlienDiceRollerProps) {
  const diceRef = useRef<THREE.Group>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [targetResult, setTargetResult] = useState<AlienActionFace | null>(null);
  
  // El motor genera el resultado
  const rollWithEngineResult = (result: AlienActionFace) => {
    console.log('[AlienDice] Rolling with engine result:', result);
    
    setTargetResult(result);
    setIsRolling(true);
    
    // Animación visual
    setTimeout(() => {
      setIsRolling(false);
      onRollComplete(result);
    }, 2000);
  };
  
  // Animación
  useFrame((state, delta) => {
    if (isRolling && diceRef.current) {
      // Rotar dado
      diceRef.current.rotation.x += delta * 10;
      diceRef.current.rotation.y += delta * 8;
    }
  });
  
  const { scene } = useGLTF('/assets/3d/dice/dice_alien_action.glb');
  
  return (
    <group ref={diceRef}>
      <primitive object={scene.clone()} />
    </group>
  );
}
```

#### Paso 3: Integrar con acción del motor

```typescript
// components/ui/AlienTurnPanel.tsx

export function AlienTurnPanel() {
  const gameState = useGameStore(state => state.gameState);
  const dispatchAction = useGameStore(state => state.dispatchAction);
  const [showDice, setShowDice] = useState(false);
  
  const handleAlienAction = () => {
    // 1. Disparar acción al motor
    const result = dispatchAction({
      type: ActionType.ALIEN_ROLL_ACTION,
      playerId: gameState.currentPlayerId,
      timestamp: Date.now(),
    });
    
    if (result.success) {
      // 2. Motor ya calculó el resultado
      const diceResult = result.events?.find(
        e => e.type === GameEventType.DICE_ROLLED
      )?.data.result as AlienActionFace;
      
      // 3. Mostrar dado con animación
      setShowDice(true);
      
      // 4. Animar dado para revelar resultado calculado por motor
      // (El resultado YA fue aplicado por el motor)
    }
  };
  
  return (
    <div>
      <button onClick={handleAlienAction}>
        Roll Alien Action
      </button>
      
      {showDice && (
        <Canvas>
          <AlienDiceRoller
            onRollComplete={(result) => {
              console.log('Dice animation complete, result:', result);
              setShowDice(false);
            }}
          />
        </Canvas>
      )}
    </div>
  );
}
```

---

## 🧩 Agregar Nuevo Componente UI

### Template genérico

```typescript
// components/ui/NewPanel.tsx

import { useGameStore, selectGameState } from '@/store/game-store';

export function NewPanel() {
  // 1. Leer estado del motor (a través del store)
  const gameState = useGameStore(selectGameState);
  const someUIState = useGameStore(state => state.uiState.someProperty);
  
  // 2. Obtener funciones de acción
  const dispatchAction = useGameStore(state => state.dispatchAction);
  const validateAction = useGameStore(state => state.validateAction);
  
  // 3. Early return si no hay datos
  if (!gameState) return null;
  
  // 4. Handlers de UI
  const handleSomeAction = () => {
    // Crear acción
    const action = {
      type: ActionType.SOME_ACTION,
      playerId: gameState.currentPlayerId,
      // ... parámetros
      timestamp: Date.now(),
    };
    
    // Validar (opcional)
    const validation = validateAction(action);
    if (!validation.valid) {
      alert(validation.reason);
      return;
    }
    
    // Dispatch
    const result = dispatchAction(action);
    
    // Manejar resultado si es necesario
    if (result.success) {
      // Éxito - el estado ya cambió
      // Los eventos ya fueron procesados
    }
  };
  
  // 5. Renderizado
  return (
    <div className="new-panel">
      {/* Mostrar información del estado */}
      <p>Turn: {gameState.turn}</p>
      
      {/* Botones de acción */}
      <button onClick={handleSomeAction}>
        Do Something
      </button>
    </div>
  );
}
```

---

## 📝 Checklist para Nuevas Features

### Antes de empezar
- [ ] ¿La acción existe en el motor? Si no, agregarla primero en el motor
- [ ] ¿Hay tipos/interfaces necesarios? Importarlos de `@engine`
- [ ] ¿Hay constantes? Importarlas de `@engine/domain/constants`

### Durante el desarrollo
- [ ] NO duplicar lógica de validación del motor
- [ ] NO modificar GameState directamente desde UI
- [ ] NO usar `Math.random()` para mecánicas de juego
- [ ] SÍ usar `validateAction()` para pre-validar
- [ ] SÍ usar `dispatchAction()` para modificar estado
- [ ] SÍ procesar eventos en el store si es necesario

### Testing
- [ ] Probar con estado inicial
- [ ] Probar con estados edge case
- [ ] Verificar que el motor valida correctamente
- [ ] Verificar animaciones reactivas
- [ ] Verificar notificaciones y feedback

### Documentación
- [ ] Comentar puntos de conexión con el motor
- [ ] Documentar cualquier suposición sobre el estado
- [ ] Actualizar README si es necesario

---

## 🚨 Errores Comunes y Soluciones

### Error: "Cannot read property 'X' of undefined"

**Causa:** Acceder a estado que aún no existe

```typescript
// ❌ Puede fallar
const character = gameState.characters.get(id);
console.log(character.name); // Error si character es undefined

// ✅ Manejar caso undefined
const character = gameState.characters.get(id);
if (!character) {
  console.error('Character not found');
  return;
}
console.log(character.name);
```

### Error: Acción no se aplica

**Causa:** Validación falla silenciosamente

```typescript
// ❌ No ver por qué falló
dispatchAction(action);

// ✅ Verificar validación
const validation = validateAction(action);
if (!validation.valid) {
  console.error('Action invalid:', validation.reason);
  showError(validation.reason);
  return;
}

dispatchAction(action);
```

### Error: Animación no se dispara

**Causa:** No detectar cambio de estado correctamente

```typescript
// ❌ No reaccionar a cambios
useEffect(() => {
  animateCharacter();
}, []); // Sin dependencias

// ✅ Reaccionar a cambios específicos
useEffect(() => {
  if (character.tileId !== previousTileId) {
    animateCharacter();
  }
}, [character.tileId]); // Dependencia correcta
```

### Error: Estado desincronizado

**Causa:** Modificar estado directamente

```typescript
// ❌ NUNCA
character.tileId = newTileId;
setGameState({ ...gameState });

// ✅ SIEMPRE a través del motor
dispatchAction({
  type: ActionType.MOVE_CHARACTER,
  characterId: character.id,
  targetTileId: newTileId,
  // ...
});
```

---

## 🎓 Mejores Prácticas

1. **Leer del Store, Escribir con Acciones**
   ```typescript
   const data = useGameStore(state => state.gameState.something); // ✅
   dispatchAction({ type: ActionType.DO_SOMETHING }); // ✅
   ```

2. **Validar antes de permitir interacción**
   ```typescript
   const isValid = validateAction(action);
   <button disabled={!isValid.valid}>Do Action</button>
   ```

3. **Usar Selectors para optimizar**
   ```typescript
   // ✅ Mejor - solo re-renderiza si phase cambia
   const phase = useGameStore(state => state.gameState?.phase);
   
   // ❌ Re-renderiza en cualquier cambio de gameState
   const gameState = useGameStore(state => state.gameState);
   ```

4. **Mantener UI State separado**
   ```typescript
   // ✅ UI state en el store
   uiState: {
     selectedCharacterId: '...',
     hoveredTileId: '...',
   }
   
   // ❌ NO mezclar con GameState
   gameState: {
     // ... estado del motor
     selectedCharacter: '...', // ¡NO!
   }
   ```

5. **Comentar conexiones críticas**
   ```typescript
   // CRÍTICO: Este valor viene del motor (GameState.turn)
   // NO modificar directamente, solo leer
   const turn = gameState.turn;
   ```

---

**Recuerda:** La arquitectura de integración está diseñada para mantener el motor como fuente de verdad. Sigue estos patrones y la aplicación se mantendrá consistente, testeable y escalable.




