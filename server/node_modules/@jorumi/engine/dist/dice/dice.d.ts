/**
 * JORUMI Game Engine - Dice System
 *
 * Sistema de dados del juego con soporte para dados personalizados
 * Manual: El juego usa varios tipos de dados con caras especiales
 */
import { DiceType, AlienAttackFace, AlienActionFace, DiceRollResult } from '../domain/types';
import { RandomGenerator } from './rng';
export type DiceResult = number | AlienAttackFace | AlienActionFace;
/**
 * Clase base abstracta para todos los dados
 */
export declare abstract class Dice<T extends DiceResult> {
    protected readonly diceType: DiceType;
    protected readonly faces: T[];
    constructor(diceType: DiceType, faces: T[]);
    /**
     * Lanza el dado usando el RNG proporcionado
     */
    roll(rng: RandomGenerator): T;
    /**
     * Crea un resultado de tirada con timestamp
     */
    rollWithMetadata(rng: RandomGenerator): DiceRollResult;
    /**
     * Obtiene todas las caras posibles
     */
    getFaces(): readonly T[];
    /**
     * Obtiene el tipo de dado
     */
    getType(): DiceType;
}
/**
 * Dado de ataque alienígena
 * Manual: 6 caras con efectos especiales (escudo, control, ataque)
 */
export declare class AlienAttackDice extends Dice<AlienAttackFace> {
    constructor();
}
/**
 * Dado de acción alienígena
 * Manual: 6 caras con acciones (movimiento, escaneo, bomba)
 */
export declare class AlienActionDice extends Dice<AlienActionFace> {
    constructor();
}
/**
 * Dado estándar de 6 caras (1-6)
 * Manual: Usado para acciones humanas generales
 */
export declare class StandardD6 extends Dice<number> {
    constructor();
}
/**
 * Dos dados de 3 caras
 * Manual: Usado para ciertas mecánicas de combate
 */
export declare class TwoD3 extends Dice<number> {
    constructor();
    /**
     * Lanza dos dados de 3 caras y suma
     */
    roll(rng: RandomGenerator): number;
}
/**
 * Dado de combate
 * Manual: Usado para resolver combates
 */
export declare class CombatDice extends Dice<number> {
    constructor();
}
/**
 * Factory para crear dados según el tipo
 */
export declare class DiceFactory {
    static createDice(type: DiceType): Dice<DiceResult>;
}
/**
 * Gestor de dados para el juego
 * Mantiene instancias de dados y maneja tiradas múltiples
 */
export declare class DiceManager {
    private dice;
    constructor();
    /**
     * Lanza un dado específico
     */
    roll(type: DiceType, rng: RandomGenerator): DiceRollResult;
    /**
     * Lanza múltiples dados del mismo tipo
     */
    rollMultiple(type: DiceType, count: number, rng: RandomGenerator): DiceRollResult[];
    /**
     * Lanza varios tipos de dados diferentes
     */
    rollMixed(types: DiceType[], rng: RandomGenerator): DiceRollResult[];
}
//# sourceMappingURL=dice.d.ts.map