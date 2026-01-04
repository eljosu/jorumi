"use strict";
/**
 * JORUMI Game Engine - Random Number Generator
 *
 * RNG determinista y testeable usando Linear Congruential Generator (LCG)
 * Permite reproducción exacta de partidas mediante seeds
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomFactory = exports.FixedRandom = exports.LCGRandom = void 0;
/**
 * Implementación de LCG (Linear Congruential Generator)
 * Parámetros similares a glibc: a=1103515245, c=12345, m=2^31
 *
 * Ventajas:
 * - Determinista: mismo seed -> misma secuencia
 * - Serializable: se puede guardar y restaurar el estado
 * - Rápido: operaciones simples
 */
class LCGRandom {
    state;
    a = 1103515245;
    c = 12345;
    m = 2147483648; // 2^31
    constructor(seed) {
        // Asegurar que el seed sea positivo
        this.state = Math.abs(seed) % this.m;
    }
    next() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state / this.m;
    }
    nextInt(min, max) {
        if (min > max) {
            throw new Error(`Invalid range: min (${min}) > max (${max})`);
        }
        const range = max - min + 1;
        return Math.floor(this.next() * range) + min;
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = Math.abs(state) % this.m;
    }
}
exports.LCGRandom = LCGRandom;
/**
 * RNG que siempre devuelve valores predecibles
 * Útil para testing de casos específicos
 */
class FixedRandom {
    values;
    index;
    constructor(values) {
        if (values.length === 0) {
            throw new Error('FixedRandom requires at least one value');
        }
        this.values = values;
        this.index = 0;
    }
    next() {
        const value = this.values[this.index % this.values.length];
        this.index++;
        return value;
    }
    nextInt(min, max) {
        const range = max - min + 1;
        return Math.floor(this.next() * range) + min;
    }
    getState() {
        return this.index;
    }
    setState(state) {
        this.index = state;
    }
}
exports.FixedRandom = FixedRandom;
/**
 * Factory para crear RNG según contexto
 */
class RandomFactory {
    /**
     * Crea un RNG determinista basado en timestamp o seed específico
     */
    static createSeeded(seed) {
        const actualSeed = seed ?? Date.now();
        return new LCGRandom(actualSeed);
    }
    /**
     * Crea un RNG fijo para testing
     */
    static createFixed(values) {
        return new FixedRandom(values);
    }
    /**
     * Crea un RNG desde un estado guardado
     */
    static fromState(state) {
        const rng = new LCGRandom(0);
        rng.setState(state);
        return rng;
    }
}
exports.RandomFactory = RandomFactory;
//# sourceMappingURL=rng.js.map