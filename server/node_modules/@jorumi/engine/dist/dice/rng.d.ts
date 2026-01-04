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
export declare class LCGRandom implements RandomGenerator {
    private state;
    private readonly a;
    private readonly c;
    private readonly m;
    constructor(seed: number);
    next(): number;
    nextInt(min: number, max: number): number;
    getState(): number;
    setState(state: number): void;
}
/**
 * RNG que siempre devuelve valores predecibles
 * Útil para testing de casos específicos
 */
export declare class FixedRandom implements RandomGenerator {
    private values;
    private index;
    constructor(values: number[]);
    next(): number;
    nextInt(min: number, max: number): number;
    getState(): number;
    setState(state: number): void;
}
/**
 * Factory para crear RNG según contexto
 */
export declare class RandomFactory {
    /**
     * Crea un RNG determinista basado en timestamp o seed específico
     */
    static createSeeded(seed?: number): RandomGenerator;
    /**
     * Crea un RNG fijo para testing
     */
    static createFixed(values: number[]): RandomGenerator;
    /**
     * Crea un RNG desde un estado guardado
     */
    static fromState(state: number): RandomGenerator;
}
//# sourceMappingURL=rng.d.ts.map