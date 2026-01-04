/**
 * JORUMI Game Engine - Action Validators
 *
 * Validadores de acciones según las reglas del manual
 * Cada validador verifica si una acción es legal en el estado actual
 */
import { GameState, ValidationResult } from '../domain/types';
import { GameAction } from './types';
/**
 * Manual: Fase 3 - Validar movimiento de personaje
 */
export declare function validateMoveCharacter(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Fase 4 - Validar recolección de recursos
 */
export declare function validateGatherResources(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Fase 5 - Validar construcción de edificio
 */
export declare function validateBuildStructure(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Curación de heridos
 */
export declare function validateHealWounded(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Fase 5 - Validar transferencia de recursos
 */
export declare function validateTransferResources(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Fase 6 - Validar ataque al alienígena
 */
export declare function validateAttackAlien(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Control alienígena de guetto
 */
export declare function validateAlienControlGhetto(state: GameState, action: GameAction): ValidationResult;
/**
 * Manual: Activar baliza (condición de victoria)
 */
export declare function validateActivateBeacon(state: GameState, action: GameAction): ValidationResult;
/**
 * Valida cualquier acción
 */
export declare function validateAction(state: GameState, action: GameAction): ValidationResult;
//# sourceMappingURL=validators.d.ts.map