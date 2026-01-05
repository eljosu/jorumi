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
import { useRef, useState, useMemo } from 'react';
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
  
  // Generar decoración procedural basada en tipo
  const decoration = useMemo(() => {
    const seed = tile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rng = () => (Math.sin(seed) * 10000) % 1;
    
    switch (tile.type) {
      case TileType.FOREST:
        // 3-5 árboles pequeños
        const treeCount = 3 + Math.floor(rng() * 3);
        return Array.from({ length: treeCount }, (_, i) => ({
          type: 'tree',
          x: (rng() - 0.5) * 1.5,
          z: (rng() - 0.5) * 1.5,
          scale: 0.3 + rng() * 0.3,
        }));
      
      case TileType.MINE:
        // Rocas/cristales
        const rockCount = 2 + Math.floor(rng() * 2);
        return Array.from({ length: rockCount }, (_, i) => ({
          type: 'rock',
          x: (rng() - 0.5) * 1.2,
          z: (rng() - 0.5) * 1.2,
          scale: 0.2 + rng() * 0.2,
        }));
      
      case TileType.RUINS:
        // Pilares/ruinas
        return [
          { type: 'pillar', x: 0.4, z: 0.2, scale: 0.5 },
          { type: 'pillar', x: -0.3, z: -0.4, scale: 0.3 },
        ];
      
      case TileType.WASTELAND:
        // Escombros dispersos
        const debrisCount = 2 + Math.floor(rng() * 3);
        return Array.from({ length: debrisCount }, (_, i) => ({
          type: 'debris',
          x: (rng() - 0.5) * 1.4,
          z: (rng() - 0.5) * 1.4,
          scale: 0.1 + rng() * 0.15,
        }));
      
      default:
        return [];
    }
  }, [tile.id, tile.type]);
  
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
      
      {/* Decoración procedural basada en tipo */}
      {decoration.map((item, index) => (
        <group key={index} position={[item.x, 0.2, item.z]}>
          {item.type === 'tree' && (
            <>
              {/* Tronco */}
              <mesh position={[0, item.scale * 0.3, 0]}>
                <cylinderGeometry args={[0.05 * item.scale, 0.08 * item.scale, item.scale * 0.6, 6]} />
                <meshStandardMaterial color="#3d2817" />
              </mesh>
              {/* Copa */}
              <mesh position={[0, item.scale * 0.8, 0]}>
                <coneGeometry args={[item.scale * 0.3, item.scale * 0.6, 6]} />
                <meshStandardMaterial color="#1a5f1a" />
              </mesh>
            </>
          )}
          
          {item.type === 'rock' && (
            <mesh position={[0, item.scale * 0.5, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
              <dodecahedronGeometry args={[item.scale * 0.4, 0]} />
              <meshStandardMaterial color="#606060" roughness={0.8} metalness={0.3} />
            </mesh>
          )}
          
          {item.type === 'pillar' && (
            <mesh position={[0, item.scale * 0.5, 0]}>
              <cylinderGeometry args={[0.15 * item.scale, 0.12 * item.scale, item.scale, 8]} />
              <meshStandardMaterial color="#8b7355" roughness={0.9} />
            </mesh>
          )}
          
          {item.type === 'debris' && (
            <mesh position={[0, item.scale * 0.3, 0]} rotation={[Math.random(), Math.random(), Math.random()]}>
              <boxGeometry args={[item.scale * 0.8, item.scale * 0.5, item.scale * 0.6]} />
              <meshStandardMaterial color="#4a4a4a" roughness={1} />
            </mesh>
          )}
        </group>
      ))}
      
      {/* Edificio (si existe) */}
      {tile.building && (
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.6, 0.9, 0.6]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.6} metalness={0.2} />
        </mesh>
      )}
      
      {/* TODO: Renderizar recursos si existen */}
      {/* Iconos de recursos se pueden añadir aquí */}
    </group>
  );
}



