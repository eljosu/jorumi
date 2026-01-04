/**
 * JORUMI Game Engine - Game Rules
 *
 * Reglas del juego implementadas como funciones puras
 * Manual: Implementación fiel de todas las mecánicas
 */
import { GameState, VictoryCondition, PlayerRole, Ghetto, Character, CharacterType } from '../domain/types';
/**
 * Manual: Los humanos consumen comida cada turno
 * Si no hay suficiente comida, mueren humanos
 */
export declare function applyFoodConsumption(ghetto: Ghetto): {
    ghetto: Ghetto;
    deaths: number;
    event: string;
};
/**
 * Manual: Los heridos necesitan medicina o pueden morir
 */
export declare function applyWoundedCare(ghetto: Ghetto): {
    ghetto: Ghetto;
    deaths: number;
    event: string;
};
/**
 * Manual: Cuando un guetto es controlado por el alienígena
 * - Los personajes en ese guetto no pueden actuar
 * - Los recursos pueden ser robados
 * - Puede recuperarse mediante combate
 */
export declare function applyAlienControl(ghetto: Ghetto, characters: Character[]): {
    ghetto: Ghetto;
    characters: Character[];
};
/**
 * Manual: Liberar guetto del control alienígena
 */
export declare function liberateGhetto(ghetto: Ghetto, characters: Character[]): {
    ghetto: Ghetto;
    characters: Character[];
};
/**
 * Manual: Efectos de edificios construidos
 */
export declare const BUILDING_EFFECTS: {
    BUNKER: {
        description: string;
        damageReduction: number;
    };
    HOSPITAL: {
        description: string;
        healingBonus: number;
    };
    WORKSHOP: {
        description: string;
        conversionsEnabled: boolean;
    };
    BEACON: {
        description: string;
        victoryCondition: VictoryCondition;
    };
};
/**
 * Manual: Calcular daño en combate
 */
export declare function calculateCombatDamage(attackerType: CharacterType, diceRoll: number, hasDefensiveBuilding: boolean): number;
/**
 * Manual: Aplicar daño al escudo alienígena
 */
export declare function applyDamageToAlien(currentShield: number, damage: number): {
    newShield: number;
    overflow: number;
};
/**
 * Manual: Verificar condición de victoria - Nave nodriza destruida
 */
export declare function checkMothershipDestroyed(state: GameState): boolean;
/**
 * Manual: Verificar condición de victoria - Escape en nave
 */
export declare function checkEscapeShip(state: GameState): boolean;
/**
 * Manual: Verificar condición de victoria - Baliza activada
 */
export declare function checkBeaconActivated(state: GameState): boolean;
/**
 * Manual: Verificar condición de derrota - Todos los humanos muertos
 */
export declare function checkTotalDefeat(state: GameState): boolean;
/**
 * Verificar todas las condiciones de final de partida
 */
export declare function checkGameEnd(state: GameState): {
    isGameOver: boolean;
    victoryCondition?: VictoryCondition;
    winner?: PlayerRole;
};
/**
 * Manual: Al inicio de cada turno, resetear el estado de los personajes
 */
export declare function resetCharactersForNewTurn(characters: Map<string, Character>): Map<string, Character>;
/**
 * Manual: Aplicar efectos de supervivencia en todos los guettos
 */
export declare function applySurvivalMechanics(state: GameState): {
    ghettos: Map<string, Ghetto>;
    totalDeaths: number;
    events: string[];
};
//# sourceMappingURL=game-rules.d.ts.map