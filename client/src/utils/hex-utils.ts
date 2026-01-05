/**
 * JORUMI - Hex Grid Utilities
 * 
 * Utilidades para trabajar con coordenadas hexagonales
 */

import { HexCoordinates } from '@/types/game-types';

/**
 * Obtiene las 6 coordenadas adyacentes a una posición hexagonal
 * Usando sistema de coordenadas cúbicas (q, r, s donde q + r + s = 0)
 */
export function getAdjacentHexCoordinates(coords: HexCoordinates): HexCoordinates[] {
  const { q, r, s } = coords;
  
  return [
    { q: q + 1, r: r - 1, s: s },     // Este
    { q: q + 1, r: r, s: s - 1 },     // Sureste
    { q: q, r: r + 1, s: s - 1 },     // Suroeste
    { q: q - 1, r: r + 1, s: s },     // Oeste
    { q: q - 1, r: r, s: s + 1 },     // Noroeste
    { q: q, r: r - 1, s: s + 1 },     // Noreste
  ];
}

/**
 * Calcula la distancia entre dos coordenadas hexagonales
 */
export function hexDistance(a: HexCoordinates, b: HexCoordinates): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

/**
 * Verifica si dos coordenadas hexagonales son iguales
 */
export function hexEquals(a: HexCoordinates, b: HexCoordinates): boolean {
  return a.q === b.q && a.r === b.r && a.s === b.s;
}

/**
 * Convierte coordenadas hexagonales a una clave string única
 */
export function hexToKey(coords: HexCoordinates): string {
  return `${coords.q},${coords.r},${coords.s}`;
}

/**
 * Convierte una clave string a coordenadas hexagonales
 */
export function keyToHex(key: string): HexCoordinates {
  const [q, r, s] = key.split(',').map(Number);
  return { q, r, s };
}

/**
 * Obtiene todas las posiciones válidas para colocar una loseta
 * (adyacentes a las losetas existentes)
 */
export function getValidPlacementPositions(
  existingTiles: Map<string, any>
): HexCoordinates[] {
  const validPositions = new Set<string>();
  const occupiedPositions = new Set<string>();

  // Marcar todas las posiciones ocupadas
  existingTiles.forEach((tile) => {
    occupiedPositions.add(hexToKey(tile.coordinates));
  });

  // Para cada loseta existente, agregar sus adyacentes no ocupados
  existingTiles.forEach((tile) => {
    const adjacents = getAdjacentHexCoordinates(tile.coordinates);
    
    adjacents.forEach((adjCoords) => {
      const key = hexToKey(adjCoords);
      if (!occupiedPositions.has(key)) {
        validPositions.add(key);
      }
    });
  });

  // Convertir de vuelta a coordenadas
  return Array.from(validPositions).map(keyToHex);
}

/**
 * Verifica si una posición es válida para colocar una loseta
 */
export function isValidPlacementPosition(
  coords: HexCoordinates,
  existingTiles: Map<string, any>
): boolean {
  const key = hexToKey(coords);
  
  // No se puede colocar sobre una loseta existente
  if (existingTiles.has(key)) {
    return false;
  }

  // Debe ser adyacente a al menos una loseta existente
  const adjacents = getAdjacentHexCoordinates(coords);
  return adjacents.some((adjCoords) => {
    const adjKey = hexToKey(adjCoords);
    return existingTiles.has(adjKey);
  });
}

