/**
 * Utilidades para serializar/deserializar GameState
 * 
 * El servidor envía GameState como JSON, donde los Maps se convierten en objetos.
 * Necesitamos convertirlos de vuelta a Maps en el cliente.
 */

import type { GameState } from '../types/game-types';

/**
 * Deserializa un GameState recibido del servidor
 * Convierte objetos planos a Maps donde sea necesario
 */
export function deserializeGameState(rawState: any): GameState {
  if (!rawState) {
    return rawState;
  }

  // Crear una copia del estado
  const state = { ...rawState };

  // Convertir tiles de objeto a Map
  if (state.tiles && typeof state.tiles === 'object' && !(state.tiles instanceof Map)) {
    state.tiles = new Map(Object.entries(state.tiles));
  }

  // Convertir characters de objeto a Map
  if (state.characters && typeof state.characters === 'object' && !(state.characters instanceof Map)) {
    state.characters = new Map(Object.entries(state.characters));
  }

  // Convertir ghettos de objeto a Map  
  if (state.ghettos && typeof state.ghettos === 'object' && !(state.ghettos instanceof Map)) {
    state.ghettos = new Map(Object.entries(state.ghettos));
  }

  // Convertir players de objeto a Map
  if (state.players && typeof state.players === 'object' && !(state.players instanceof Map)) {
    state.players = new Map(Object.entries(state.players));
  }

  // Convertir resourcePool de objeto a Map si existe
  if (state.resourcePool && typeof state.resourcePool === 'object' && !(state.resourcePool instanceof Map)) {
    state.resourcePool = new Map(Object.entries(state.resourcePool));
  }

  console.log('[GameStateSerializer] Deserialized state:', {
    tiles: state.tiles?.size || 0,
    characters: state.characters?.size || 0,
    ghettos: state.ghettos?.size || 0,
    players: state.players?.size || 0,
  });

  return state as GameState;
}

/**
 * Serializa un GameState para enviar al servidor
 * (Generalmente no necesario, el cliente no envía gameState completo)
 */
export function serializeGameState(state: GameState): any {
  const serialized = { ...state };

  // Convertir Maps a objetos para JSON
  if (state.tiles instanceof Map) {
    (serialized as any).tiles = Object.fromEntries(state.tiles);
  }

  if (state.characters instanceof Map) {
    (serialized as any).characters = Object.fromEntries(state.characters);
  }

  if (state.ghettos instanceof Map) {
    (serialized as any).ghettos = Object.fromEntries(state.ghettos);
  }

  if (state.players instanceof Map) {
    (serialized as any).players = Object.fromEntries(state.players);
  }

  return serialized;
}

