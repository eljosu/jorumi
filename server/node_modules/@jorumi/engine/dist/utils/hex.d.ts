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
export declare function isValidHexCoordinate(coord: HexCoordinates): boolean;
/**
 * Crea coordenadas hexagonales validadas
 */
export declare function createHexCoordinate(q: number, r: number): HexCoordinates;
/**
 * Calcula la distancia entre dos coordenadas hexagonales
 * Manual: Usado para determinar rango de movimiento
 */
export declare function hexDistance(a: HexCoordinates, b: HexCoordinates): number;
/**
 * Obtiene las coordenadas de casillas adyacentes
 * Manual: Las casillas adyacentes están a distancia 1
 */
export declare function getAdjacentHexCoordinates(coord: HexCoordinates): HexCoordinates[];
/**
 * Obtiene todas las coordenadas dentro de un rango
 * Manual: Usado para determinar área de movimiento de personajes
 */
export declare function getHexCoordinatesInRange(center: HexCoordinates, range: number): HexCoordinates[];
/**
 * Verifica si dos coordenadas son iguales
 */
export declare function hexEquals(a: HexCoordinates, b: HexCoordinates): boolean;
/**
 * Convierte coordenadas hex a string único (para usar como clave)
 */
export declare function hexToString(coord: HexCoordinates): string;
/**
 * Convierte string a coordenadas hex
 */
export declare function stringToHex(str: string): HexCoordinates;
/**
 * Calcula el camino más corto entre dos coordenadas
 * Manual: Usado para movimiento de personajes y alienígena
 */
export declare function hexPath(start: HexCoordinates, end: HexCoordinates): HexCoordinates[];
/**
 * Redondea coordenadas flotantes a la casilla hexagonal más cercana
 */
export declare function hexRound(coord: {
    q: number;
    r: number;
    s: number;
}): HexCoordinates;
//# sourceMappingURL=hex.d.ts.map