/**
 * JORUMI Game Engine - Hexagonal Grid Utilities
 * 
 * Utilidades para trabajar con coordenadas hexagonales (sistema axial)
 * Manual: El mapa del juego usa una grilla hexagonal
 */

import { HexCoordinates } from '../domain/types';

/**
 * Verifica si las coordenadas hexagonales son válidas
 * En coordenadas axiales: q + r + s = 0
 */
export function isValidHexCoordinate(coord: HexCoordinates): boolean {
  return coord.q + coord.r + coord.s === 0;
}

/**
 * Crea coordenadas hexagonales validadas
 */
export function createHexCoordinate(q: number, r: number): HexCoordinates {
  const s = -q - r;
  return { q, r, s };
}

/**
 * Calcula la distancia entre dos coordenadas hexagonales
 * Manual: Usado para determinar rango de movimiento
 */
export function hexDistance(a: HexCoordinates, b: HexCoordinates): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

/**
 * Obtiene las coordenadas de casillas adyacentes
 * Manual: Las casillas adyacentes están a distancia 1
 */
export function getAdjacentHexCoordinates(coord: HexCoordinates): HexCoordinates[] {
  const directions = [
    { q: +1, r: 0, s: -1 },
    { q: +1, r: -1, s: 0 },
    { q: 0, r: -1, s: +1 },
    { q: -1, r: 0, s: +1 },
    { q: -1, r: +1, s: 0 },
    { q: 0, r: +1, s: -1 },
  ];
  
  return directions.map(dir => ({
    q: coord.q + dir.q,
    r: coord.r + dir.r,
    s: coord.s + dir.s,
  }));
}

/**
 * Obtiene todas las coordenadas dentro de un rango
 * Manual: Usado para determinar área de movimiento de personajes
 */
export function getHexCoordinatesInRange(
  center: HexCoordinates,
  range: number
): HexCoordinates[] {
  const results: HexCoordinates[] = [];
  
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      const s = -q - r;
      const coord = { q: center.q + q, r: center.r + r, s: center.s + s };
      if (hexDistance(center, coord) <= range) {
        results.push(coord);
      }
    }
  }
  
  return results;
}

/**
 * Verifica si dos coordenadas son iguales
 */
export function hexEquals(a: HexCoordinates, b: HexCoordinates): boolean {
  return a.q === b.q && a.r === b.r && a.s === b.s;
}

/**
 * Convierte coordenadas hex a string único (para usar como clave)
 */
export function hexToString(coord: HexCoordinates): string {
  return `${coord.q},${coord.r},${coord.s}`;
}

/**
 * Convierte string a coordenadas hex
 */
export function stringToHex(str: string): HexCoordinates {
  const [q, r, s] = str.split(',').map(Number);
  return { q, r, s };
}

/**
 * Calcula el camino más corto entre dos coordenadas
 * Manual: Usado para movimiento de personajes y alienígena
 */
export function hexPath(start: HexCoordinates, end: HexCoordinates): HexCoordinates[] {
  const distance = hexDistance(start, end);
  const path: HexCoordinates[] = [];
  
  for (let i = 0; i <= distance; i++) {
    const t = distance === 0 ? 0 : i / distance;
    const q = start.q + (end.q - start.q) * t;
    const r = start.r + (end.r - start.r) * t;
    const s = start.s + (end.s - start.s) * t;
    
    // Redondear a las coordenadas hexagonales más cercanas
    path.push(hexRound({ q, r, s }));
  }
  
  return path;
}

/**
 * Redondea coordenadas flotantes a la casilla hexagonal más cercana
 */
export function hexRound(coord: { q: number; r: number; s: number }): HexCoordinates {
  let q = Math.round(coord.q);
  let r = Math.round(coord.r);
  let s = Math.round(coord.s);
  
  const qDiff = Math.abs(q - coord.q);
  const rDiff = Math.abs(r - coord.r);
  const sDiff = Math.abs(s - coord.s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }
  
  return { q, r, s };
}



