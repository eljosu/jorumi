"use strict";
/**
 * JORUMI Game Engine - Dice System
 *
 * Sistema de dados del juego con soporte para dados personalizados
 * Manual: El juego usa varios tipos de dados con caras especiales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiceManager = exports.DiceFactory = exports.CombatDice = exports.TwoD3 = exports.StandardD6 = exports.AlienActionDice = exports.AlienAttackDice = exports.Dice = void 0;
const types_1 = require("../domain/types");
// ============================================================================
// CLASE BASE DE DADO
// ============================================================================
/**
 * Clase base abstracta para todos los dados
 */
class Dice {
    constructor(diceType, faces) {
        this.diceType = diceType;
        this.faces = faces;
        if (faces.length === 0) {
            throw new Error(`Dice must have at least one face`);
        }
    }
    /**
     * Lanza el dado usando el RNG proporcionado
     */
    roll(rng) {
        const index = rng.nextInt(0, this.faces.length - 1);
        return this.faces[index];
    }
    /**
     * Crea un resultado de tirada con timestamp
     */
    rollWithMetadata(rng) {
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
    getFaces() {
        return [...this.faces];
    }
    /**
     * Obtiene el tipo de dado
     */
    getType() {
        return this.diceType;
    }
}
exports.Dice = Dice;
// ============================================================================
// DADOS ESPECÍFICOS DEL JUEGO
// ============================================================================
/**
 * Dado de ataque alienígena
 * Manual: 6 caras con efectos especiales (escudo, control, ataque)
 */
class AlienAttackDice extends Dice {
    constructor() {
        const faces = [
            types_1.AlienAttackFace.SHIELD,
            types_1.AlienAttackFace.SHIELD,
            types_1.AlienAttackFace.CONTROL,
            types_1.AlienAttackFace.ATTACK,
            types_1.AlienAttackFace.ATTACK,
            types_1.AlienAttackFace.DOUBLE_ATTACK,
        ];
        super(types_1.DiceType.ALIEN_ATTACK, faces);
    }
}
exports.AlienAttackDice = AlienAttackDice;
/**
 * Dado de acción alienígena
 * Manual: 6 caras con acciones (movimiento, escaneo, bomba)
 */
class AlienActionDice extends Dice {
    constructor() {
        const faces = [
            types_1.AlienActionFace.MOVE,
            types_1.AlienActionFace.MOVE,
            types_1.AlienActionFace.SCAN,
            types_1.AlienActionFace.SCAN,
            types_1.AlienActionFace.BOMB,
            types_1.AlienActionFace.SPECIAL,
        ];
        super(types_1.DiceType.ALIEN_ACTION, faces);
    }
}
exports.AlienActionDice = AlienActionDice;
/**
 * Dado estándar de 6 caras (1-6)
 * Manual: Usado para acciones humanas generales
 */
class StandardD6 extends Dice {
    constructor() {
        super(types_1.DiceType.HUMAN_D6, [1, 2, 3, 4, 5, 6]);
    }
}
exports.StandardD6 = StandardD6;
/**
 * Dos dados de 3 caras
 * Manual: Usado para ciertas mecánicas de combate
 */
class TwoD3 extends Dice {
    constructor() {
        // Resultado posible: 2-6 (suma de dos dados de 1-3)
        // Distribución: 2(1), 3(2), 4(3), 5(2), 6(1)
        super(types_1.DiceType.HUMAN_2D3, [2, 3, 3, 4, 4, 4, 5, 5, 6]);
    }
    /**
     * Lanza dos dados de 3 caras y suma
     */
    roll(rng) {
        const die1 = rng.nextInt(1, 3);
        const die2 = rng.nextInt(1, 3);
        return die1 + die2;
    }
}
exports.TwoD3 = TwoD3;
/**
 * Dado de combate
 * Manual: Usado para resolver combates
 */
class CombatDice extends Dice {
    constructor() {
        super(types_1.DiceType.COMBAT, [1, 2, 3, 4, 5, 6]);
    }
}
exports.CombatDice = CombatDice;
// ============================================================================
// FACTORY Y GESTIÓN DE DADOS
// ============================================================================
/**
 * Factory para crear dados según el tipo
 */
class DiceFactory {
    static createDice(type) {
        switch (type) {
            case types_1.DiceType.ALIEN_ATTACK:
                return new AlienAttackDice();
            case types_1.DiceType.ALIEN_ACTION:
                return new AlienActionDice();
            case types_1.DiceType.HUMAN_D6:
                return new StandardD6();
            case types_1.DiceType.HUMAN_2D3:
                return new TwoD3();
            case types_1.DiceType.COMBAT:
                return new CombatDice();
            default:
                throw new Error(`Unknown dice type: ${type}`);
        }
    }
}
exports.DiceFactory = DiceFactory;
/**
 * Gestor de dados para el juego
 * Mantiene instancias de dados y maneja tiradas múltiples
 */
class DiceManager {
    constructor() {
        this.dice = new Map();
        // Pre-crear todos los tipos de dados
        Object.values(types_1.DiceType).forEach(type => {
            this.dice.set(type, DiceFactory.createDice(type));
        });
    }
    /**
     * Lanza un dado específico
     */
    roll(type, rng) {
        const dice = this.dice.get(type);
        if (!dice) {
            throw new Error(`Dice type ${type} not found`);
        }
        return dice.rollWithMetadata(rng);
    }
    /**
     * Lanza múltiples dados del mismo tipo
     */
    rollMultiple(type, count, rng) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.roll(type, rng));
        }
        return results;
    }
    /**
     * Lanza varios tipos de dados diferentes
     */
    rollMixed(types, rng) {
        return types.map(type => this.roll(type, rng));
    }
}
exports.DiceManager = DiceManager;
//# sourceMappingURL=dice.js.map