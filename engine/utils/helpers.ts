/**
 * JORUMI Game Engine - Helper Utilities
 * 
 * Funciones auxiliares generales
 */

import { ResourceInventory, ResourceType } from '../domain/types';

/**
 * Crea un inventario de recursos vacío
 */
export function createEmptyInventory(): ResourceInventory {
  return {
    [ResourceType.FOOD]: 0,
    [ResourceType.MEDICINE]: 0,
    [ResourceType.METAL]: 0,
    [ResourceType.MINERALS]: 0,
  };
}

/**
 * Clona un inventario de recursos
 */
export function cloneInventory(inventory: ResourceInventory): ResourceInventory {
  return {
    [ResourceType.FOOD]: inventory[ResourceType.FOOD],
    [ResourceType.MEDICINE]: inventory[ResourceType.MEDICINE],
    [ResourceType.METAL]: inventory[ResourceType.METAL],
    [ResourceType.MINERALS]: inventory[ResourceType.MINERALS],
  };
}

/**
 * Suma dos inventarios
 */
export function addInventories(
  a: ResourceInventory,
  b: Partial<ResourceInventory>
): ResourceInventory {
  return {
    [ResourceType.FOOD]: a[ResourceType.FOOD] + (b[ResourceType.FOOD] ?? 0),
    [ResourceType.MEDICINE]: a[ResourceType.MEDICINE] + (b[ResourceType.MEDICINE] ?? 0),
    [ResourceType.METAL]: a[ResourceType.METAL] + (b[ResourceType.METAL] ?? 0),
    [ResourceType.MINERALS]: a[ResourceType.MINERALS] + (b[ResourceType.MINERALS] ?? 0),
  };
}

/**
 * Resta inventarios (no permite negativos)
 */
export function subtractInventories(
  a: ResourceInventory,
  b: Partial<ResourceInventory>
): ResourceInventory {
  return {
    [ResourceType.FOOD]: Math.max(0, a[ResourceType.FOOD] - (b[ResourceType.FOOD] ?? 0)),
    [ResourceType.MEDICINE]: Math.max(0, a[ResourceType.MEDICINE] - (b[ResourceType.MEDICINE] ?? 0)),
    [ResourceType.METAL]: Math.max(0, a[ResourceType.METAL] - (b[ResourceType.METAL] ?? 0)),
    [ResourceType.MINERALS]: Math.max(0, a[ResourceType.MINERALS] - (b[ResourceType.MINERALS] ?? 0)),
  };
}

/**
 * Verifica si un inventario tiene suficientes recursos
 */
export function hasEnoughResources(
  inventory: ResourceInventory,
  required: Partial<ResourceInventory>
): boolean {
  return (
    inventory[ResourceType.FOOD] >= (required[ResourceType.FOOD] ?? 0) &&
    inventory[ResourceType.MEDICINE] >= (required[ResourceType.MEDICINE] ?? 0) &&
    inventory[ResourceType.METAL] >= (required[ResourceType.METAL] ?? 0) &&
    inventory[ResourceType.MINERALS] >= (required[ResourceType.MINERALS] ?? 0)
  );
}

/**
 * Calcula el total de recursos en un inventario
 */
export function getTotalResources(inventory: ResourceInventory): number {
  return (
    inventory[ResourceType.FOOD] +
    inventory[ResourceType.MEDICINE] +
    inventory[ResourceType.METAL] +
    inventory[ResourceType.MINERALS]
  );
}

/**
 * Genera un ID único
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Clona profundo de un objeto (solo para objetos serializables)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica si un número está en un rango
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp un valor entre min y max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Shuffle un array (Fisher-Yates)
 */
export function shuffle<T>(array: T[], rng?: () => number): T[] {
  const result = [...array];
  const random = rng ?? Math.random;
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Selecciona un elemento aleatorio de un array
 */
export function randomElement<T>(array: T[], rng?: () => number): T {
  if (array.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  const random = rng ?? Math.random;
  const index = Math.floor(random() * array.length);
  return array[index];
}



