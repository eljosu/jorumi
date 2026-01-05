/**
 * JORUMI - Hex Tile Component
 * 
 * Representa una loseta hexagonal del tablero
 * 
 * MAPEO Estado → Visual:
 * - tile.type → Color y textura
 * - tile.destroyed → Apariencia destruida
 * - tile.building → Muestra edificio
 * - tile.resources → Muestra recursos
 */

import { Tile, TileType } from '@/types/game-types';
import { hexToWorld } from '@/utils/coordinate-converter';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HexTileProps {
  tile: Tile;
}

// Colores por tipo de loseta
const TILE_COLORS: Record<TileType, string> = {
  [TileType.GHETTO]: '#8B4513',
  [TileType.FOREST]: '#228B22',
  [TileType.MINE]: '#696969',
  [TileType.RUINS]: '#A0522D',
  [TileType.ALIEN_SHIP]: '#4B0082',
  [TileType.WASTELAND]: '#8B7355',
};

export function HexTile({ tile }: HexTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  
  // Convertir coordenadas hexagonales a mundo 3D
  const position = hexToWorld(tile.coordinates, 0);
  
  // Estado visual
  const isDestroyed = tile.destroyed;
  
  // Color basado en estado
  let color = TILE_COLORS[tile.type];
  if (isDestroyed) color = '#333333';
  if (selected) color = '#FFFF00';
  
  // Animación de hover
  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.position.y = 0.1;
    } else if (meshRef.current) {
      meshRef.current.position.y = 0;
    }
  });
  
  // Click handler
  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelected(!selected);
    
    // TODO: Enviar acción al servidor si es necesario
    // Por ejemplo, si hay un personaje seleccionado y este es un movimiento válido
  };
  
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Hexágono base */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 0.2, 6]} />
        <meshStandardMaterial
          color={color}
          opacity={isDestroyed ? 0.3 : 1.0}
          transparent={isDestroyed}
          emissive={hovered ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Borde del hexágono */}
      <lineSegments position={[0, 0.11, 0]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(1, 1, 0.2, 6)]} />
        <lineBasicMaterial color="#000000" linewidth={2} />
      </lineSegments>
      
      {/* TODO: Renderizar edificio si existe */}
      {tile.building && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      )}
      
      {/* TODO: Renderizar recursos si existen */}
      {/* Placeholder para recursos */}
    </group>
  );
}



