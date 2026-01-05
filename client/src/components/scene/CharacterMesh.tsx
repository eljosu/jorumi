/**
 * JORUMI - Character Mesh Component
 * 
 * Representa un personaje en el tablero 3D
 * 
 * MAPEO Estado → Visual:
 * - character.type → Modelo 3D específico
 * - character.isWounded → Material rojo / animación
 * - character.canAct → Brillo / indicador visual
 * - character.tileId → Posición en el mundo
 * 
 * CRÍTICO:
 * - El movimiento es una ANIMACIÓN reactiva al cambio de tileId
 * - NO se modifica la posición del personaje directamente
 * - El motor determina si el movimiento es válido
 */

import { Character, Tile, TileId } from '@/types/game-types';
import { hexToWorld } from '@/utils/coordinate-converter';
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterMeshProps {
  character: Character;
  tiles: Map<TileId, Tile>;
}

// Colores por tipo de personaje (placeholder hasta que carguemos modelos GLB)
const CHARACTER_COLORS: Record<string, string> = {
  DOCTOR: '#00FF00',
  SOLDIER: '#FF0000',
  PEASANT: '#FFFF00',
  CONSTRUCTOR: '#FFA500',
  MINER: '#8B4513',
};

export function CharacterMesh({ character, tiles }: CharacterMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [startPos, setStartPos] = useState<THREE.Vector3>(new THREE.Vector3());
  const [targetPos, setTargetPos] = useState<THREE.Vector3>(new THREE.Vector3());
  const [animProgress, setAnimProgress] = useState(0);
  
  // UI state
  const [isSelected, setIsSelected] = useState(false);
  
  // Obtener posición actual
  const currentTile = character.tileId ? tiles.get(character.tileId) : null;
  const ghettoTile = tiles.get(
    Array.from(tiles.values()).find(t => t.type === 'GHETTO')?.id || ''
  );
  
  const tile = currentTile || ghettoTile;
  
  if (!tile) {
    // Personaje no tiene posición válida
    return null;
  }
  
  const worldPos = hexToWorld(tile.coordinates, 0.5);
  
  // Detectar cambio de posición para animar
  useEffect(() => {
    if (meshRef.current) {
      const currentWorldPos = new THREE.Vector3(
        meshRef.current.position.x,
        0.5,
        meshRef.current.position.z
      );
      
      // Si la posición objetivo cambió, iniciar animación
      if (currentWorldPos.distanceTo(worldPos) > 0.1) {
        setStartPos(currentWorldPos);
        setTargetPos(worldPos);
        setAnimProgress(0);
        setAnimating(true);
      }
    }
  }, [worldPos]);
  
  // Animación de movimiento
  useFrame((state, delta) => {
    if (animating && meshRef.current) {
      setAnimProgress((prev) => Math.min(prev + delta * 2, 1));
      
      // Interpolación suave
      const t = animProgress;
      const eased = t * t * (3 - 2 * t); // Smoothstep
      
      meshRef.current.position.lerpVectors(startPos, targetPos, eased);
      
      // Añadir efecto de salto
      const jumpHeight = Math.sin(t * Math.PI) * 0.5;
      meshRef.current.position.y = 0.5 + jumpHeight;
      
      // Finalizar animación
      if (animProgress >= 1) {
        setAnimating(false);
        meshRef.current.position.copy(targetPos);
      }
    }
    
    // Animación de selección (bob)
    if (isSelected && meshRef.current && !animating) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  // Click handler
  const handleClick = (e: any) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
    console.log('[CharacterMesh] Selected character:', character.id);
  };
  
  // Color basado en estado
  let color = CHARACTER_COLORS[character.type] || '#FFFFFF';
  if (character.isWounded) color = '#FF0000';
  if (!character.canAct) color = '#666666';
  
  return (
    <mesh
      ref={meshRef}
      position={[worldPos.x, 0.5, worldPos.z]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      {/* Por ahora usamos una esfera, luego cargaremos el modelo GLB */}
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={isSelected || hovered ? '#ffffff' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
      />
      
      {/* Indicador de selección */}
      {isSelected && (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#FFFF00" side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* TODO: Cargar modelo GLB real usando assetManager */}
    </mesh>
  );
}



