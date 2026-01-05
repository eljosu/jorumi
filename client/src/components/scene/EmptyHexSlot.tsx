/**
 * JORUMI - Empty Hex Slot
 * 
 * Representa una posición vacía donde se puede colocar una loseta
 * 
 * FUNCIONALIDAD:
 * - Muestra hexágonos transparentes en posiciones válidas
 * - Resalta cuando el mouse pasa sobre ellos
 * - Maneja clicks para colocar losetas
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HexCoordinates } from '@/types/game-types';
import { hexToWorld } from '@/utils/coordinate-converter';

interface EmptyHexSlotProps {
  coordinates: HexCoordinates;
  isValid: boolean;
  onPlaceTile: (coordinates: HexCoordinates) => void;
}

export function EmptyHexSlot({ coordinates, isValid, onPlaceTile }: EmptyHexSlotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Convertir coordenadas hexagonales a mundo 3D
  const position = hexToWorld(coordinates, 0);

  // Animación de hover
  useFrame(() => {
    if (meshRef.current) {
      if (hovered && isValid) {
        meshRef.current.position.y = 0.15;
      } else {
        meshRef.current.position.y = 0;
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isValid) {
      console.log('[EmptyHexSlot] Placing tile at:', coordinates);
      onPlaceTile(coordinates);
    }
  };

  // Si no es válida, no la mostramos o la mostramos muy tenue
  if (!isValid) {
    return null;
  }

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Hexágono transparente */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[1, 1, 0.1, 6]} />
        <meshStandardMaterial
          color={hovered ? '#00ff00' : '#88ff88'}
          opacity={hovered ? 0.6 : 0.3}
          transparent
          emissive={hovered ? '#00ff00' : '#004400'}
          emissiveIntensity={hovered ? 0.5 : 0.1}
        />
      </mesh>

      {/* Borde del hexágono */}
      <lineSegments position={[0, 0.06, 0]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(1, 1, 0.1, 6)]} />
        <lineBasicMaterial 
          color={hovered ? '#00ff00' : '#44ff44'} 
          linewidth={hovered ? 3 : 2}
          opacity={hovered ? 1 : 0.6}
          transparent
        />
      </lineSegments>

      {/* Icono de + cuando hover */}
      {hovered && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

