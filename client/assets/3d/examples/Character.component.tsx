/**
 * JORUMI Character Component
 * 
 * Componente completo para renderizar personajes del juego
 * con animaciones, estados y efectos visuales.
 */

import { useGLTF, Html } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterType } from '../../../engine/domain/types';

// ============================================================================
// INTERFACES
// ============================================================================

interface CharacterProps {
  type: CharacterType;
  position: [number, number, number];
  rotation?: number; // Rotation in radians around Y axis
  isWounded?: boolean;
  isUsed?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  canAct?: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  showHealthBar?: boolean;
  showNameTag?: boolean;
  name?: string;
}

// ============================================================================
// ASSET PATHS
// ============================================================================

const CHARACTER_PATHS: Record<CharacterType, string> = {
  [CharacterType.DOCTOR]: '/assets/3d/characters/doctor/char_doctor_01.glb',
  [CharacterType.SOLDIER]: '/assets/3d/characters/soldier/char_soldier_01.glb',
  [CharacterType.PEASANT]: '/assets/3d/characters/peasant/char_peasant_01.glb',
  [CharacterType.CONSTRUCTOR]: '/assets/3d/characters/constructor/char_constructor_01.glb',
  [CharacterType.MINER]: '/assets/3d/characters/miner/char_miner_01.glb',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Character({
  type,
  position,
  rotation = 0,
  isWounded = false,
  isUsed = false,
  isHovered = false,
  isSelected = false,
  canAct = true,
  onClick,
  onHover,
  showHealthBar = false,
  showNameTag = false,
  name,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [localHovered, setLocalHovered] = useState(false);
  
  // Load model
  const { scene } = useGLTF(CHARACTER_PATHS[type]);
  const clonedScene = scene.clone();
  
  // Hover animation
  useFrame((state) => {
    if (groupRef.current && (isHovered || localHovered || isSelected)) {
      // Gentle bounce
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    } else if (groupRef.current) {
      // Reset to base position
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        position[1],
        0.1
      );
    }
  });
  
  // Handle pointer events
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setLocalHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setLocalHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
    >
      {/* Character Model */}
      <primitive
        object={clonedScene}
        scale={1}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      
      {/* Selection Ring */}
      {(isSelected || localHovered) && (
        <SelectionRing color={isSelected ? '#00D9FF' : '#ffffff'} />
      )}
      
      {/* Status Indicators */}
      {isWounded && <WoundedIndicator />}
      {isUsed && <UsedIndicator />}
      {!canAct && <DisabledOverlay />}
      
      {/* Name Tag */}
      {showNameTag && name && (
        <Html position={[0, 2.2, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {name}
          </div>
        </Html>
      )}
      
      {/* Health Bar */}
      {showHealthBar && (
        <HealthBar health={isWounded ? 50 : 100} maxHealth={100} />
      )}
    </group>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SelectionRing({ color }: { color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      ringRef.current.scale.set(scale, 1, scale);
      
      // Rotation
      ringRef.current.rotation.z += 0.02;
    }
  });
  
  return (
    <mesh
      ref={ringRef}
      position={[0, 0.05, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.6, 0.7, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WoundedIndicator() {
  return (
    <>
      {/* Red cross above head */}
      <Html position={[0, 2, 0]} center distanceFactor={15}>
        <div style={{
          color: '#ff4444',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 4px black',
          pointerEvents: 'none',
        }}>
          +
        </div>
      </Html>
      
      {/* Red glow */}
      <pointLight position={[0, 1, 0]} color="#ff4444" intensity={0.5} distance={2} />
    </>
  );
}

function UsedIndicator() {
  return (
    <>
      {/* Checkmark */}
      <Html position={[0.5, 2, 0]} center distanceFactor={20}>
        <div style={{
          color: '#88ff88',
          fontSize: '18px',
          fontWeight: 'bold',
          textShadow: '0 0 4px black',
          pointerEvents: 'none',
        }}>
          ✓
        </div>
      </Html>
    </>
  );
}

function DisabledOverlay() {
  return (
    <mesh position={[0, 1, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

interface HealthBarProps {
  health: number;
  maxHealth: number;
}

function HealthBar({ health, maxHealth }: HealthBarProps) {
  const percentage = (health / maxHealth) * 100;
  const color = percentage > 50 ? '#44ff44' : percentage > 25 ? '#ffff44' : '#ff4444';
  
  return (
    <Html position={[0, 2.5, 0]} center distanceFactor={15}>
      <div style={{
        width: '50px',
        height: '6px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '3px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </Html>
  );
}

// ============================================================================
// PRELOAD
// ============================================================================

// Preload all character models at app initialization
export function preloadCharacters() {
  Object.values(CHARACTER_PATHS).forEach(path => {
    useGLTF.preload(path);
  });
}

// Call in app initialization:
// preloadCharacters();

// ============================================================================
// CHARACTER TYPE UTILITIES
// ============================================================================

export const CHARACTER_NAMES: Record<CharacterType, string> = {
  [CharacterType.DOCTOR]: 'Doctor',
  [CharacterType.SOLDIER]: 'Soldado',
  [CharacterType.PEASANT]: 'Campesino',
  [CharacterType.CONSTRUCTOR]: 'Constructor',
  [CharacterType.MINER]: 'Minero',
};

export const CHARACTER_COLORS: Record<CharacterType, string> = {
  [CharacterType.DOCTOR]: '#E8E8E8',
  [CharacterType.SOLDIER]: '#4A5D4A',
  [CharacterType.PEASANT]: '#8B6F47',
  [CharacterType.CONSTRUCTOR]: '#D97629',
  [CharacterType.MINER]: '#6B7280',
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import { Character } from './Character.component';
import { CharacterType } from '../../../engine/domain/types';

function MyGame() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  return (
    <Canvas>
      <Character
        type={CharacterType.DOCTOR}
        position={[0, 0, 0]}
        rotation={Math.PI / 4}
        isSelected={selectedCharacter === 'doctor-1'}
        onClick={() => setSelectedCharacter('doctor-1')}
        showNameTag
        name="Dr. Smith"
        showHealthBar
        canAct={true}
      />
    </Canvas>
  );
}
*/



