/**
 * JORUMI Game Engine - Dice System
 * 
 * Sistema de dados del juego con soporte para dados personalizados
 * Manual: El juego usa varios tipos de dados con caras especiales
 */

import { 
  DiceType, 
  AlienAttackFace, 
  AlienActionFace,
  DiceRollResult 
} from '../domain/types';
import { DICE_CONFIGURATION } from '../domain/constants';
import { RandomGenerator } from './rng';

// ============================================================================
// TIPOS DE RESULTADOS DE DADOS
// ============================================================================

export type DiceResult = 
  | number 
  | AlienAttackFace 
  | AlienActionFace;

// ============================================================================
// CLASE BASE DE DADO
// ============================================================================

/**
 * Clase base abstracta para todos los dados
 */
export abstract class Dice<T extends DiceResult> {
  constructor(
    protected readonly diceType: DiceType,
    protected readonly faces: T[]
  ) {
    if (faces.length === 0) {
      throw new Error(`Dice must have at least one face`);
    }
  }
  
  /**
   * Lanza el dado usando el RNG proporcionado
   */
  roll(rng: RandomGenerator): T {
    const index = rng.nextInt(0, this.faces.length - 1);
    return this.faces[index];
  }
  
  /**
   * Crea un resultado de tirada con timestamp
   */
  rollWithMetadata(rng: RandomGenerator): DiceRollResult {
    const result = this.roll(rng);
    return {
      diceType: this.diceType,
      result,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Obtiene todas las caras posibles
   */
  getFaces(): readonly T[] {
    return [...this.faces];
  }
  
  /**
   * Obtiene el tipo de dado
   */
  getType(): DiceType {
    return this.diceType;
  }
}

// ============================================================================
// DADOS ESPECÍFICOS DEL JUEGO
// ============================================================================

/**
 * Dado de ataque alienígena
 * Manual: 6 caras con efectos especiales (escudo, control, ataque)
 */
export class AlienAttackDice extends Dice<AlienAttackFace> {
  constructor() {
    const faces: AlienAttackFace[] = [
      AlienAttackFace.SHIELD,
      AlienAttackFace.SHIELD,
      AlienAttackFace.CONTROL,
      AlienAttackFace.ATTACK,
      AlienAttackFace.ATTACK,
      AlienAttackFace.DOUBLE_ATTACK,
    ];
    super(DiceType.ALIEN_ATTACK, faces);
  }
}

/**
 * Dado de acción alienígena
 * Manual: 6 caras con acciones (movimiento, escaneo, bomba)
 */
export class AlienActionDice extends Dice<AlienActionFace> {
  constructor() {
    const faces: AlienActionFace[] = [
      AlienActionFace.MOVE,
      AlienActionFace.MOVE,
      AlienActionFace.SCAN,
      AlienActionFace.SCAN,
      AlienActionFace.BOMB,
      AlienActionFace.SPECIAL,
    ];
    super(DiceType.ALIEN_ACTION, faces);
  }
}

/**
 * Dado estándar de 6 caras (1-6)
 * Manual: Usado para acciones humanas generales
 */
export class StandardD6 extends Dice<number> {
  constructor() {
    super(DiceType.HUMAN_D6, [1, 2, 3, 4, 5, 6]);
  }
}

/**
 * Dos dados de 3 caras
 * Manual: Usado para ciertas mecánicas de combate
 */
export class TwoD3 extends Dice<number> {
  constructor() {
    // Resultado posible: 2-6 (suma de dos dados de 1-3)
    // Distribución: 2(1), 3(2), 4(3), 5(2), 6(1)
    super(DiceType.HUMAN_2D3, [2, 3, 3, 4, 4, 4, 5, 5, 6]);
  }
  
  /**
   * Lanza dos dados de 3 caras y suma
   */
  override roll(rng: RandomGenerator): number {
    const die1 = rng.nextInt(1, 3);
    const die2 = rng.nextInt(1, 3);
    return die1 + die2;
  }
}

/**
 * Dado de combate
 * Manual: Usado para resolver combates
 */
export class CombatDice extends Dice<number> {
  constructor() {
    super(DiceType.COMBAT, [1, 2, 3, 4, 5, 6]);
  }
}

// ============================================================================
// FACTORY Y GESTIÓN DE DADOS
// ============================================================================

/**
 * Factory para crear dados según el tipo
 */
export class DiceFactory {
  static createDice(type: DiceType): Dice<DiceResult> {
    switch (type) {
      case DiceType.ALIEN_ATTACK:
        return new AlienAttackDice();
      case DiceType.ALIEN_ACTION:
        return new AlienActionDice();
      case DiceType.HUMAN_D6:
        return new StandardD6();
      case DiceType.HUMAN_2D3:
        return new TwoD3();
      case DiceType.COMBAT:
        return new CombatDice();
      default:
        throw new Error(`Unknown dice type: ${type}`);
    }
  }
}

/**
 * Gestor de dados para el juego
 * Mantiene instancias de dados y maneja tiradas múltiples
 */
export class DiceManager {
  private dice: Map<DiceType, Dice<DiceResult>>;
  
  constructor() {
    this.dice = new Map();
    // Pre-crear todos los tipos de dados
    Object.values(DiceType).forEach(type => {
      this.dice.set(type, DiceFactory.createDice(type));
    });
  }
  
  /**
   * Lanza un dado específico
   */
  roll(type: DiceType, rng: RandomGenerator): DiceRollResult {
    const dice = this.dice.get(type);
    if (!dice) {
      throw new Error(`Dice type ${type} not found`);
    }
    return dice.rollWithMetadata(rng);
  }
  
  /**
   * Lanza múltiples dados del mismo tipo
   */
  rollMultiple(type: DiceType, count: number, rng: RandomGenerator): DiceRollResult[] {
    const results: DiceRollResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.roll(type, rng));
    }
    return results;
  }
  
  /**
   * Lanza varios tipos de dados diferentes
   */
  rollMixed(types: DiceType[], rng: RandomGenerator): DiceRollResult[] {
    return types.map(type => this.roll(type, rng));
  }
}



