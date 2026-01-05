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

// Colores por tipo de loseta (más brillantes y visibles)
const TILE_COLORS: Record<TileType, string> = {
  [TileType.GHETTO]: '#D2691E',      // Chocolate claro
  [TileType.FOREST]: '#32CD32',      // Verde lima
  [TileType.MINE]: '#A9A9A9',        // Gris claro
  [TileType.RUINS]: '#CD853F',       // Perú (marrón anaranjado)
  [TileType.ALIEN_SHIP]: '#8B00FF',  // Violeta brillante
  [TileType.WASTELAND]: '#DAA520',   // Dorado oscuro
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
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 0.3, 6]} />
        <meshStandardMaterial
          color={color}
          opacity={isDestroyed ? 0.3 : 1.0}
          transparent={isDestroyed}
          emissive={hovered ? '#ffff88' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Borde del hexágono (más visible) */}
      <lineSegments position={[0, 0.16, 0]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(1, 1, 0.3, 6)]} />
        <lineBasicMaterial color="#222222" linewidth={3} />
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



