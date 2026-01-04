/**
 * JORUMI Game Engine - Basic Usage Examples
 * 
 * Ejemplos de cómo usar el motor de juego
 */

import { GameEngine } from '../core/game-engine';
import { ActionType, CharacterType, ResourceType } from '../domain/types';

/**
 * Ejemplo 1: Crear una partida básica
 */
export function example1_CreateGame() {
  console.log('=== Example 1: Create Game ===\n');
  
  const engine = new GameEngine({ enableLogging: true });
  
  // Iniciar partida con 2 jugadores
  const state = engine.startGame({
    playerNames: ['Alice', 'Bob'],
    seed: 12345, // Seed fijo para reproducibilidad
  });
  
  console.log('Game created!');
  console.log('Game ID:', state.gameId);
  console.log('Turn:', state.turn);
  console.log('Phase:', state.phase);
  console.log('Ghettos:', state.ghettos.size);
  console.log('Characters:', state.characters.size);
  console.log('\nStats:', engine.getStats());
  
  return engine;
}

/**
 * Ejemplo 2: Mover un personaje
 */
export function example2_MoveCharacter() {
  console.log('\n=== Example 2: Move Character ===\n');
  
  const engine = new GameEngine({ enableLogging: false });
  const state = engine.startGame({
    playerNames: ['Player 1', 'Player 2'],
    seed: 12345,
  });
  
  // Avanzar a fase de movimiento
  engine.advancePhase(); // PREPARATION -> EXPLORATION
  engine.advancePhase(); // EXPLORATION -> MOVEMENT
  
  console.log('Current phase:', engine.getState().phase);
  
  // Obtener primer personaje
  const character = Array.from(state.characters.values())[0];
  const targetTile = Array.from(state.tiles.values())[1];
  
  console.log('Moving character:', character.name, '(', character.type, ')');
  console.log('From ghetto:', character.ghettoId);
  console.log('To tile:', targetTile.id);
  
  // Crear acción de movimiento
  const moveAction: any = {
    type: ActionType.MOVE_CHARACTER,
    playerId: state.currentPlayerId,
    characterId: character.id,
    targetTileId: targetTile.id,
    timestamp: Date.now(),
  };
  
  // Validar acción
  const validation = engine.validateAction(moveAction);
  console.log('Validation:', validation);
  
  // Aplicar acción
  const result = engine.applyAction(moveAction);
  
  if (result.success) {
    console.log('✓ Character moved successfully!');
    console.log('Events:', result.events);
  } else {
    console.log('✗ Move failed:', result.error);
  }
  
  return engine;
}

/**
 * Ejemplo 3: Recolectar recursos
 */
export function example3_GatherResources() {
  console.log('\n=== Example 3: Gather Resources ===\n');
  
  const engine = new GameEngine({ enableLogging: false });
  const state = engine.startGame({
    playerNames: ['Player 1'],
    seed: 54321,
  });
  
  // Avanzar a fase de recolección
  engine.advancePhase(); // PREPARATION -> EXPLORATION
  engine.advancePhase(); // EXPLORATION -> MOVEMENT
  engine.advancePhase(); // MOVEMENT -> RESOURCE_GATHERING
  
  console.log('Current phase:', engine.getState().phase);
  
  // Buscar un campesino (recolecta comida)
  const peasant = Array.from(state.characters.values()).find(
    c => c.type === CharacterType.PEASANT
  );
  
  if (!peasant) {
    console.log('No peasant found!');
    return engine;
  }
  
  console.log('Peasant:', peasant.name);
  console.log('Gathering food...');
  
  const gatherAction: any = {
    type: ActionType.GATHER_RESOURCES,
    playerId: state.currentPlayerId,
    characterId: peasant.id,
    resourceType: ResourceType.FOOD,
    amount: 3, // Campesino recoge 3 de comida
    timestamp: Date.now(),
  };
  
  const result = engine.applyAction(gatherAction);
  
  if (result.success) {
    console.log('✓ Resources gathered!');
    
    // Verificar recursos del guetto
    const ghetto = engine.getState().ghettos.get(peasant.ghettoId);
    console.log('Ghetto resources:', ghetto?.resources);
  } else {
    console.log('✗ Gathering failed:', result.error);
  }
  
  return engine;
}

/**
 * Ejemplo 4: Construir un edificio
 */
export function example4_BuildStructure() {
  console.log('\n=== Example 4: Build Structure ===\n');
  
  const engine = new GameEngine({ enableLogging: false });
  const state = engine.startGame({
    playerNames: ['Player 1'],
    seed: 99999,
  });
  
  // Avanzar a fase de comercio (donde se puede construir)
  for (let i = 0; i < 5; i++) {
    engine.advancePhase();
  }
  
  console.log('Current phase:', engine.getState().phase);
  
  // Buscar constructor
  const constructor = Array.from(state.characters.values()).find(
    c => c.type === CharacterType.CONSTRUCTOR
  );
  
  if (!constructor) {
    console.log('No constructor found!');
    return engine;
  }
  
  // Obtener guetto
  const ghetto = state.ghettos.get(constructor.ghettoId);
  
  if (!ghetto) {
    console.log('Ghetto not found!');
    return engine;
  }
  
  console.log('Constructor:', constructor.name);
  console.log('Ghetto:', ghetto.name);
  console.log('Current resources:', ghetto.resources);
  console.log('Attempting to build BUNKER (costs 3 metal)...');
  
  const buildAction: any = {
    type: ActionType.BUILD_STRUCTURE,
    playerId: state.currentPlayerId,
    characterId: constructor.id,
    ghettoId: ghetto.id,
    buildingType: 'BUNKER',
    timestamp: Date.now(),
  };
  
  const result = engine.applyAction(buildAction);
  
  if (result.success) {
    console.log('✓ Building constructed!');
    const updatedGhetto = engine.getState().ghettos.get(ghetto.id);
    console.log('Buildings:', updatedGhetto?.buildings);
    console.log('Remaining resources:', updatedGhetto?.resources);
  } else {
    console.log('✗ Construction failed:', result.error);
  }
  
  return engine;
}

/**
 * Ejemplo 5: Turno completo
 */
export function example5_CompleteTurn() {
  console.log('\n=== Example 5: Complete Turn ===\n');
  
  const engine = new GameEngine({ enableLogging: true });
  engine.startGame({
    playerNames: ['Human Player', 'Alien Player'],
    seed: 11111,
  });
  
  console.log('\nStarting turn 1...\n');
  
  // Ciclo completo de fases
  const phases = [
    'PREPARATION',
    'EXPLORATION',
    'MOVEMENT',
    'RESOURCE_GATHERING',
    'TRADING',
    'ALIEN_TURN',
    'ROLE_CHECK',
    'END_GAME_CHECK',
  ];
  
  for (const expectedPhase of phases) {
    const currentState = engine.getState();
    console.log(`Phase: ${currentState.phase} (expected: ${expectedPhase})`);
    
    // Avanzar fase
    const result = engine.advancePhase();
    
    if (!result.success) {
      console.log('Failed to advance:', result.error);
      break;
    }
  }
  
  const finalState = engine.getState();
  console.log('\nTurn completed!');
  console.log('Current turn:', finalState.turn);
  console.log('Current phase:', finalState.phase);
  
  return engine;
}

/**
 * Ejemplo 6: Guardar y cargar partida
 */
export function example6_SaveLoad() {
  console.log('\n=== Example 6: Save & Load ===\n');
  
  // Crear y jugar una partida
  const engine1 = new GameEngine();
  engine1.startGame({
    playerNames: ['Alice'],
    seed: 77777,
  });
  
  console.log('Original game turn:', engine1.getState().turn);
  console.log('Original stats:', engine1.getStats());
  
  // Guardar partida
  const savedGame = engine1.saveGame();
  console.log('\nGame saved! (', savedGame.length, 'bytes)');
  
  // Crear nuevo motor y cargar partida
  const engine2 = new GameEngine();
  const loadedState = engine2.loadGame(savedGame);
  
  console.log('\nGame loaded!');
  console.log('Loaded game turn:', loadedState.turn);
  console.log('Loaded stats:', engine2.getStats());
  
  // Verificar que son iguales
  const original = engine1.getState();
  const loaded = engine2.getState();
  
  console.log('\nVerification:');
  console.log('Game IDs match:', original.gameId === loaded.gameId);
  console.log('Turns match:', original.turn === loaded.turn);
  console.log('Phases match:', original.phase === loaded.phase);
  
  return engine2;
}

/**
 * Ejemplo 7: Sistema de dados
 */
export function example7_DiceSystem() {
  console.log('\n=== Example 7: Dice System ===\n');
  
  const engine = new GameEngine();
  engine.startGame({
    playerNames: ['Player'],
    seed: 42, // Seed fijo para resultados reproducibles
  });
  
  const diceManager = engine.getDiceManager();
  const rng = engine.getRNG();
  
  console.log('Rolling dice with seed 42 (deterministic):\n');
  
  // Lanzar dado de ataque alienígena
  console.log('Alien Attack Dice:');
  for (let i = 0; i < 5; i++) {
    const result = diceManager.roll('ALIEN_ATTACK', rng);
    console.log(`  Roll ${i + 1}:`, result.result);
  }
  
  // Lanzar dado estándar
  console.log('\nStandard D6:');
  for (let i = 0; i < 5; i++) {
    const result = diceManager.roll('HUMAN_D6', rng);
    console.log(`  Roll ${i + 1}:`, result.result);
  }
  
  // Lanzar dado de acción alienígena
  console.log('\nAlien Action Dice:');
  for (let i = 0; i < 5; i++) {
    const result = diceManager.roll('ALIEN_ACTION', rng);
    console.log(`  Roll ${i + 1}:`, result.result);
  }
  
  return engine;
}

// ============================================================================
// EJECUTAR TODOS LOS EJEMPLOS
// ============================================================================

export function runAllExamples() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   JORUMI GAME ENGINE - EXAMPLES        ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  example1_CreateGame();
  example2_MoveCharacter();
  example3_GatherResources();
  example4_BuildStructure();
  example5_CompleteTurn();
  example6_SaveLoad();
  example7_DiceSystem();
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ALL EXAMPLES COMPLETED               ║');
  console.log('╚════════════════════════════════════════╝\n');
}

// Si se ejecuta directamente
if (require.main === module) {
  runAllExamples();
}



