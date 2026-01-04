/**
 * JORUMI Game Engine - Random Number Generator
 * 
 * RNG determinista y testeable usando Linear Congruential Generator (LCG)
 * Permite reproducción exacta de partidas mediante seeds
 */

/**
 * Interfaz para generadores de números aleatorios
 * Permite inyectar diferentes implementaciones (testing, producción, etc.)
 */
export interface RandomGenerator {
  /**
   * Genera un número flotante entre 0 (inclusive) y 1 (exclusive)
   */
  next(): number;
  
  /**
   * Genera un entero entre min (inclusive) y max (inclusive)
   */
  nextInt(min: number, max: number): number;
  
  /**
   * Obtiene el estado actual (para serialización)
   */
  getState(): number;
  
  /**
   * Restaura el estado (para deserialización)
   */
  setState(state: number): void;
}

/**
 * Implementación de LCG (Linear Congruential Generator)
 * Parámetros similares a glibc: a=1103515245, c=12345, m=2^31
 * 
 * Ventajas:
 * - Determinista: mismo seed -> misma secuencia
 * - Serializable: se puede guardar y restaurar el estado
 * - Rápido: operaciones simples
 */
export class LCGRandom implements RandomGenerator {
  private state: number;
  private readonly a = 1103515245;
  private readonly c = 12345;
  private readonly m = 2147483648; // 2^31
  
  constructor(seed: number) {
    // Asegurar que el seed sea positivo
    this.state = Math.abs(seed) % this.m;
  }
  
  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }
  
  nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Invalid range: min (${min}) > max (${max})`);
    }
    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }
  
  getState(): number {
    return this.state;
  }
  
  setState(state: number): void {
    this.state = Math.abs(state) % this.m;
  }
}

/**
 * RNG que siempre devuelve valores predecibles
 * Útil para testing de casos específicos
 */
export class FixedRandom implements RandomGenerator {
  private values: number[];
  private index: number;
  
  constructor(values: number[]) {
    if (values.length === 0) {
      throw new Error('FixedRandom requires at least one value');
    }
    this.values = values;
    this.index = 0;
  }
  
  next(): number {
    const value = this.values[this.index % this.values.length];
    this.index++;
    return value;
  }
  
  nextInt(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }
  
  getState(): number {
    return this.index;
  }
  
  setState(state: number): void {
    this.index = state;
  }
}

/**
 * Factory para crear RNG según contexto
 */
export class RandomFactory {
  /**
   * Crea un RNG determinista basado en timestamp o seed específico
   */
  static createSeeded(seed?: number): RandomGenerator {
    const actualSeed = seed ?? Date.now();
    return new LCGRandom(actualSeed);
  }
  
  /**
   * Crea un RNG fijo para testing
   */
  static createFixed(values: number[]): RandomGenerator {
    return new FixedRandom(values);
  }
  
  /**
   * Crea un RNG desde un estado guardado
   */
  static fromState(state: number): RandomGenerator {
    const rng = new LCGRandom(0);
    rng.setState(state);
    return rng;
  }
}



