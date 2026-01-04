/**
 * JORUMI - Coordinate Converter
 * 
 * Conversión entre coordenadas hexagonales (del motor) y coordenadas
 * cartesianas 3D (para Three.js)
 * 
 * IMPORTANTE:
 * - El motor usa coordenadas hexagonales axiales (q, r, s)
 * - Three.js usa coordenadas cartesianas (x, y, z)
 * - Esta utilidad es SOLO para visualización, NO afecta las reglas
 */

import { HexCoordinates } from '@/types/game-types';
import * as THREE from 'three';

/**
 * Tamaño del hexágono (distancia del centro a un vértice)
 */
export const HEX_SIZE = 1.0;

/**
 * Espaciado entre hexágonos
 */
export const HEX_SPACING = 1.1;

/**
 * Convierte coordenadas hexagonales axiales a posición 3D
 * 
 * Sistema de coordenadas:
 * - X: horizontal
 * - Y: vertical (altura)
 * - Z: profundidad
 * 
 * @param hex Coordenadas hexagonales del motor
 * @param height Altura Y (opcional)
 * @returns Vector3 de Three.js
 */
export function hexToWorld(hex: HexCoordinates, height: number = 0): THREE.Vector3 {
  const { q, r } = hex;
  
  // Conversión flat-top hexagon
  const x = HEX_SIZE * HEX_SPACING * (3/2 * q);
  const z = HEX_SIZE * HEX_SPACING * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  
  return new THREE.Vector3(x, height, z);
}

/**
 * Convierte posición 3D a coordenadas hexagonales aproximadas
 * Útil para detectar clicks en el tablero
 * 
 * @param worldPos Posición en el mundo 3D
 * @returns Coordenadas hexagonales
 */
export function worldToHex(worldPos: THREE.Vector3): HexCoordinates {
  const x = worldPos.x;
  const z = worldPos.z;
  
  // Conversión inversa
  const q = (2/3 * x) / (HEX_SIZE * HEX_SPACING);
  const r = (-1/3 * x + Math.sqrt(3)/3 * z) / (HEX_SIZE * HEX_SPACING);
  const s = -q - r;
  
  // Redondear a coordenadas enteras
  return hexRound({ q, r, s });
}

/**
 * Redondea coordenadas hexagonales a enteros
 * Necesario porque las conversiones pueden dar decimales
 */
export function hexRound(hex: HexCoordinates): HexCoordinates {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  let s = Math.round(hex.s);
  
  const qDiff = Math.abs(q - hex.q);
  const rDiff = Math.abs(r - hex.r);
  const sDiff = Math.abs(s - hex.s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }
  
  return { q, r, s };
}

/**
 * Calcula el ángulo de rotación para que un objeto mire hacia un hex
 */
export function getRotationTowards(from: HexCoordinates, to: HexCoordinates): number {
  const fromWorld = hexToWorld(from);
  const toWorld = hexToWorld(to);
  
  const dx = toWorld.x - fromWorld.x;
  const dz = toWorld.z - fromWorld.z;
  
  return Math.atan2(dx, dz);
}

/**
 * Obtiene los vértices de un hexágono para renderizado
 */
export function getHexVertices(center: THREE.Vector3): THREE.Vector3[] {
  const vertices: THREE.Vector3[] = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = center.x + HEX_SIZE * Math.cos(angle);
    const z = center.z + HEX_SIZE * Math.sin(angle);
    vertices.push(new THREE.Vector3(x, center.y, z));
  }
  
  return vertices;
}



