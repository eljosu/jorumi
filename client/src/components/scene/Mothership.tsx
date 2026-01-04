/**
 * JORUMI - Mothership Component
 * 
 * Nave nodriza alienígena
 * 
 * MAPEO Estado → Visual:
 * - alien.mothershipHealth → Efectos de daño
 * - alien.mothershipShield → Escudo visual
 * - alien.currentTileId → Posición
 */

import { Tile, TileId } from '@engine/index';
import { hexToWorld } from '@/utils/coordinate-converter';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MothershipProps {
  tileId: TileId;
  tiles: Map<TileId, Tile>;
  health: number;
  shield: number;
}

export function Mothership({ tileId, tiles, health, shield }: MothershipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  
  const tile = tiles.get(tileId);
  if (!tile) return null;
  
  const position = hexToWorld(tile.coordinates, 3);
  
  // Animaciones
  useFrame((state) => {
    if (groupRef.current) {
      // Hover suave
      groupRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      
      // Rotación lenta
      groupRef.current.rotation.y += 0.002;
    }
    
    // Shield pulse
    if (shieldRef.current && shield > 0) {
      const scale = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      shieldRef.current.scale.set(scale, scale, scale);
      
      // Opacidad basada en escudo
      const material = shieldRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.3 + (shield / 10) * 0.3;
    }
  });
  
  // Color basado en salud
  const healthPercent = health / 100; // Asumiendo max 100
  const damaged = healthPercent < 0.5;
  
  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Nave nodriza (placeholder - luego cargar GLB) */}
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color={damaged ? '#AA0000' : '#4B0082'}
          emissive={damaged ? '#FF0000' : '#8B00FF'}
          emissiveIntensity={damaged ? 0.5 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Escudo */}
      {shield > 0 && (
        <mesh ref={shieldRef}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            color="#00FFFF"
            transparent
            opacity={0.3}
            emissive="#00FFFF"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Luz amenazante */}
      <pointLight
        position={[0, 0, 0]}
        intensity={damaged ? 3 : 2}
        color={damaged ? '#FF0000' : '#8B00FF'}
        distance={10}
      />
      
      {/* TODO: Cargar modelo GLB real */}
    </group>
  );
}



