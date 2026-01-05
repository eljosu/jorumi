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

// Colores por tipo de loseta (NEW YORK POST-INVASION)
const TILE_COLORS: Record<TileType, string> = {
  // Losetas básicas
  [TileType.GHETTO]: '#D2691E',      // Chocolate claro
  [TileType.FOREST]: '#32CD32',      // Verde lima
  [TileType.MINE]: '#A9A9A9',        // Gris claro
  [TileType.RUINS]: '#8B4513',       // Marrón oscuro (ruinas)
  [TileType.ALIEN_SHIP]: '#8B00FF',  // Violeta brillante
  [TileType.WASTELAND]: '#DAA520',   // Dorado oscuro
  
  // Losetas de New York
  [TileType.SEA]: '#1E90FF',         // Azul océano
  [TileType.BRIDGE]: '#696969',      // Gris acero
  [TileType.BUNKER_TILE]: '#708090', // Gris pizarra
  [TileType.GARDEN]: '#7CFC00',      // Verde césped
  [TileType.HOSPITAL_TILE]: '#FFFFFF', // Blanco + cruz roja
  
  // Losetas especiales (aliens)
  [TileType.TOXIC_WASTE]: '#00FF00', // Verde tóxico
  [TileType.MINE_TRAP]: '#8B0000',   // Rojo oscuro
  
  // Losetas únicas (Liberty Island)
  [TileType.LIBERTY_ISLAND]: '#90EE90', // Verde claro (césped)
  [TileType.SPACESHIP_PART]: '#C0C0C0', // Plateado (metal)
  [TileType.RESCUE_BEACON_TILE]: '#FFD700', // Dorado (beacon)
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
  
  // Generar decoración procedural basada en tipo (NEW YORK POST-INVASION)
  const decoration = useMemo(() => {
    const seed = tile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let seedCounter = seed;
    const rng = () => {
      seedCounter += 1;
      return (Math.sin(seedCounter) * 10000) % 1;
    };
    
    switch (tile.type) {
      case TileType.FOREST:
        const treeCount = 3 + Math.floor(rng() * 3);
        return Array.from({ length: treeCount }, () => ({
          type: 'tree',
          x: (rng() - 0.5) * 1.5,
          z: (rng() - 0.5) * 1.5,
          scale: 0.3 + rng() * 0.3,
        }));
      
      case TileType.MINE:
        const rockCount = 2 + Math.floor(rng() * 2);
        return Array.from({ length: rockCount }, () => ({
          type: 'rock',
          x: (rng() - 0.5) * 1.2,
          z: (rng() - 0.5) * 1.2,
          scale: 0.2 + rng() * 0.2,
        }));
      
      case TileType.RUINS:
        // Escombros de edificios destruidos
        return [
          { type: 'rubble', x: 0.4, z: 0.2, scale: 0.5 },
          { type: 'rubble', x: -0.3, z: -0.4, scale: 0.3 },
          { type: 'rubble', x: 0, z: 0.3, scale: 0.4 },
        ];
      
      case TileType.WASTELAND:
        const debrisCount = 2 + Math.floor(rng() * 3);
        return Array.from({ length: debrisCount }, () => ({
          type: 'debris',
          x: (rng() - 0.5) * 1.4,
          z: (rng() - 0.5) * 1.4,
          scale: 0.1 + rng() * 0.15,
        }));
      
      case TileType.SEA:
        // Olas o plataforma flotante
        return [{ type: 'water', x: 0, z: 0, scale: 1 }];
      
      case TileType.BRIDGE:
        // Estructura de puente
        return [{ type: 'bridge-structure', x: 0, z: 0, scale: 1 }];
      
      case TileType.BUNKER_TILE:
        // Bunker fortificado
        return [{ type: 'bunker', x: 0, z: 0, scale: 0.8 }];
      
      case TileType.GARDEN:
        // Parcelas de cultivo
        const gardenPlots = 4;
        return Array.from({ length: gardenPlots }, (_, i) => ({
          type: 'garden-plot',
          x: (i % 2 - 0.5) * 0.8,
          z: (Math.floor(i / 2) - 0.5) * 0.8,
          scale: 0.4,
        }));
      
      case TileType.HOSPITAL_TILE:
        // Cruz roja
        return [{ type: 'red-cross', x: 0, z: 0, scale: 0.6 }];
      
      case TileType.TOXIC_WASTE:
        // Barriles tóxicos
        return [
          { type: 'toxic-barrel', x: 0.3, z: 0.2, scale: 0.3 },
          { type: 'toxic-barrel', x: -0.2, z: -0.3, scale: 0.3 },
        ];
      
      case TileType.MINE_TRAP:
        // Mina explosiva
        return [{ type: 'mine', x: 0, z: 0, scale: 0.4 }];
      
      case TileType.LIBERTY_ISLAND:
        // Estatua de la Libertad (simplificada)
        return [{ type: 'statue-liberty', x: 0, z: 0, scale: 1.2 }];
      
      case TileType.SPACESHIP_PART:
        // Parte de nave espacial
        return [{ type: 'spaceship-hull', x: 0, z: 0, scale: 0.8 }];
      
      case TileType.RESCUE_BEACON_TILE:
        // Baliza de rescate (antena)
        return [{ type: 'beacon', x: 0, z: 0, scale: 1 }];
      
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
          
          {item.type === 'rubble' && (
            <mesh position={[0, item.scale * 0.4, 0]} rotation={[0.2, Math.random() * Math.PI, 0.1]}>
              <boxGeometry args={[item.scale * 0.9, item.scale * 0.7, item.scale * 0.8]} />
              <meshStandardMaterial color="#654321" roughness={0.95} />
            </mesh>
          )}
          
          {item.type === 'water' && (
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.9, 0.9, 0.1, 32]} />
              <meshStandardMaterial 
                color="#1E90FF" 
                transparent 
                opacity={0.7} 
                roughness={0.1}
                metalness={0.3}
              />
            </mesh>
          )}
          
          {item.type === 'bridge-structure' && (
            <>
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[1.8, 0.1, 0.4]} />
                <meshStandardMaterial color="#696969" roughness={0.7} metalness={0.4} />
              </mesh>
              {/* Pilares del puente */}
              <mesh position={[-0.7, -0.05, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
                <meshStandardMaterial color="#505050" />
              </mesh>
              <mesh position={[0.7, -0.05, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
                <meshStandardMaterial color="#505050" />
              </mesh>
            </>
          )}
          
          {item.type === 'bunker' && (
            <mesh position={[0, item.scale * 0.3, 0]}>
              <boxGeometry args={[item.scale * 1.2, item.scale * 0.6, item.scale * 0.9]} />
              <meshStandardMaterial color="#708090" roughness={0.85} metalness={0.15} />
            </mesh>
          )}
          
          {item.type === 'garden-plot' && (
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[item.scale * 0.6, 0.05, item.scale * 0.6]} />
              <meshStandardMaterial color="#8B4513" roughness={0.95} />
            </mesh>
          )}
          
          {item.type === 'red-cross' && (
            <>
              {/* Vertical */}
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[item.scale * 0.2, item.scale * 0.8, 0.05]} />
                <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
              </mesh>
              {/* Horizontal */}
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[item.scale * 0.8, item.scale * 0.2, 0.05]} />
                <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
              </mesh>
            </>
          )}
          
          {item.type === 'toxic-barrel' && (
            <mesh position={[0, item.scale * 0.3, 0]}>
              <cylinderGeometry args={[item.scale * 0.2, item.scale * 0.2, item.scale * 0.6, 12]} />
              <meshStandardMaterial 
                color="#00FF00" 
                emissive="#00FF00" 
                emissiveIntensity={0.4}
                roughness={0.6}
              />
            </mesh>
          )}
          
          {item.type === 'mine' && (
            <>
              {/* Base de la mina */}
              <mesh position={[0, item.scale * 0.2, 0]}>
                <sphereGeometry args={[item.scale * 0.3, 16, 16]} />
                <meshStandardMaterial color="#8B0000" roughness={0.7} metalness={0.5} />
              </mesh>
              {/* Detonadores */}
              {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((angle, i) => (
                <mesh 
                  key={i}
                  position={[
                    Math.cos(angle) * item.scale * 0.25,
                    item.scale * 0.2,
                    Math.sin(angle) * item.scale * 0.25
                  ]}
                >
                  <cylinderGeometry args={[0.03, 0.03, item.scale * 0.15, 6]} />
                  <meshStandardMaterial color="#FF0000" />
                </mesh>
              ))}
            </>
          )}
          
          {item.type === 'statue-liberty' && (
            <>
              {/* Pedestal */}
              <mesh position={[0, item.scale * 0.3, 0]}>
                <cylinderGeometry args={[0.3 * item.scale, 0.35 * item.scale, 0.6 * item.scale, 8]} />
                <meshStandardMaterial color="#A0A0A0" roughness={0.8} />
              </mesh>
              {/* Estatua simplificada */}
              <mesh position={[0, item.scale * 0.9, 0]}>
                <cylinderGeometry args={[0.15 * item.scale, 0.1 * item.scale, 0.8 * item.scale, 8]} />
                <meshStandardMaterial color="#7FB069" roughness={0.7} metalness={0.2} />
              </mesh>
              {/* Antorcha */}
              <mesh position={[0.15 * item.scale, item.scale * 1.4, 0]}>
                <coneGeometry args={[0.08 * item.scale, 0.2 * item.scale, 8]} />
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700" 
                  emissiveIntensity={0.5}
                />
              </mesh>
            </>
          )}
          
          {item.type === 'spaceship-hull' && (
            <mesh position={[0, item.scale * 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[item.scale * 1.2, item.scale * 0.4, item.scale * 0.8]} />
              <meshStandardMaterial 
                color="#C0C0C0" 
                roughness={0.3} 
                metalness={0.8}
                emissive="#4169E1"
                emissiveIntensity={0.2}
              />
            </mesh>
          )}
          
          {item.type === 'beacon' && (
            <>
              {/* Base */}
              <mesh position={[0, item.scale * 0.2, 0]}>
                <cylinderGeometry args={[0.2 * item.scale, 0.25 * item.scale, 0.4 * item.scale, 8]} />
                <meshStandardMaterial color="#696969" roughness={0.6} metalness={0.5} />
              </mesh>
              {/* Antena */}
              <mesh position={[0, item.scale * 0.7, 0]}>
                <cylinderGeometry args={[0.05 * item.scale, 0.08 * item.scale, item.scale, 8]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.7} />
              </mesh>
              {/* Luz parpadeante */}
              <mesh position={[0, item.scale * 1.2, 0]}>
                <sphereGeometry args={[0.1 * item.scale, 16, 16]} />
                <meshStandardMaterial 
                  color="#FFD700"
                  emissive="#FFD700"
                  emissiveIntensity={0.8}
                />
              </mesh>
            </>
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



