/**
 * JORUMI Game Engine - Helper Utilities
 *
 * Funciones auxiliares generales
 */
import { ResourceInventory } from '../domain/types';
/**
 * Crea un inventario de recursos vacío
 */
export declare function createEmptyInventory(): ResourceInventory;
/**
 * Clona un inventario de recursos
 */
export declare function cloneInventory(inventory: ResourceInventory): ResourceInventory;
/**
 * Suma dos inventarios
 */
export declare function addInventories(a: ResourceInventory, b: Partial<ResourceInventory>): ResourceInventory;
/**
 * Resta inventarios (no permite negativos)
 */
export declare function subtractInventories(a: ResourceInventory, b: Partial<ResourceInventory>): ResourceInventory;
/**
 * Verifica si un inventario tiene suficientes recursos
 */
export declare function hasEnoughResources(inventory: ResourceInventory, required: Partial<ResourceInventory>): boolean;
/**
 * Calcula el total de recursos en un inventario
 */
export declare function getTotalResources(inventory: ResourceInventory): number;
/**
 * Genera un ID único
 */
export declare function generateId(prefix: string): string;
/**
 * Clona profundo de un objeto (solo para objetos serializables)
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Verifica si un número está en un rango
 */
export declare function inRange(value: number, min: number, max: number): boolean;
/**
 * Clamp un valor entre min y max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Shuffle un array (Fisher-Yates)
 */
export declare function shuffle<T>(array: T[], rng?: () => number): T[];
/**
 * Selecciona un elemento aleatorio de un array
 */
export declare function randomElement<T>(array: T[], rng?: () => number): T;
//# sourceMappingURL=helpers.d.ts.map