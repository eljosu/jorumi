/**
 * JORUMI Game Engine - State Factory
 *
 * Factory para crear estados iniciales del juego
 */
import { GameState } from '../domain/types';
/**
 * Configuración para crear una nueva partida
 */
export interface GameConfig {
    playerNames: string[];
    seed?: number;
    customInitialState?: Partial<GameState>;
}
/**
 * Factory principal: crea el estado inicial completo del juego
 * Manual: Configuración inicial según las reglas oficiales
 * NEW YORK POST-INVASION: 4 ghettos + Liberty Island
 */
export declare function createInitialGameState(config: GameConfig): GameState;
/**
 * Clona completamente un estado de juego (deep clone)
 */
export declare function cloneGameState(state: GameState): GameState;
/**
 * Serializa un estado de juego a JSON
 */
export declare function serializeGameState(state: GameState): string;
/**
 * Deserializa un estado de juego desde JSON
 */
export declare function deserializeGameState(json: string): GameState;
//# sourceMappingURL=state-factory.d.ts.map