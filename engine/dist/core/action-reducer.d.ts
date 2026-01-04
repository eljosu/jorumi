/**
 * JORUMI Game Engine - Action Reducer
 *
 * Reducer que aplica acciones al estado de forma inmutable
 * Pattern: Redux-like reducer para máxima predictibilidad
 */
import { GameState } from '../domain/types';
import { GameAction, ActionResult } from '../actions/types';
/**
 * Reducer principal: aplica una acción al estado
 * Retorna un nuevo estado (inmutable)
 */
export declare function reduceAction(state: GameState, action: GameAction): ActionResult;
//# sourceMappingURL=action-reducer.d.ts.map