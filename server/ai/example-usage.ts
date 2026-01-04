/**
 * JORUMI AI - Example Usage
 * 
 * Ejemplos completos de cómo usar la IA alienígena
 */

import { GameState, GamePhase } from '../../engine/domain/types';
import { GameEngine } from '../../engine/core/game-engine';
import { DiceManager, DiceType } from '../../engine/dice/dice';
import { RandomGenerator } from '../../engine/dice/rng';
import {
  createAlienAI,
  createDeterministicAlienAI,
  DifficultyLevel,
  configureAILogger,
} from './index';

// ============================================================================
// EJEMPLO 1: USO BÁSICO
// ============================================================================

/**
 * Ejemplo básico: IA decide una acción en el turno alienígena
 */
export function basicExample() {
  console.log('\n=== EJEMPLO 1: USO BÁSICO ===\n');
  
  // 1. Crear una instancia de la IA
  const alienAI = createAlienAI(DifficultyLevel.NORMAL);
  
  // 2. Simular un estado de juego (en producción viene del motor)
  const gameState: GameState = createMockGameState();
  
  // 3. La IA decide qué hacer
  const decision = alienAI.decideTurn(gameState);
  
  // 4. Extraer la acción y aplicarla
  console.log('AI Decision:');
  console.log('  Action:', decision.action.type);
  console.log('  Reasoning:', decision.reasoning);
  console.log('  Confidence:', (decision.confidence * 100).toFixed(1) + '%');
  console.log('  Score:', decision.heuristics.totalScore.toFixed(1));
  
  // 5. Aplicar la acción al motor de reglas
  // const result = gameEngine.applyAction(decision.action, gameState);
  
  return decision;
}

// ============================================================================
// EJEMPLO 2: INTEGRACIÓN CON DADOS
// ============================================================================

/**
 * Ejemplo con dados: La IA decide basándose en resultados de dados
 */
export function exampleWithDice() {
  console.log('\n=== EJEMPLO 2: INTEGRACIÓN CON DADOS ===\n');
  
  const alienAI = createAlienAI(DifficultyLevel.NORMAL);
  const gameState = createMockGameState();
  
  // Crear RNG y gestor de dados
  const rng = new RandomGenerator(gameState.rngSeed);
  const diceManager = new DiceManager();
  
  // Lanzar dados alienígenas
  const attackDice = diceManager.roll(DiceType.ALIEN_ATTACK, rng);
  const actionDice = diceManager.roll(DiceType.ALIEN_ACTION, rng);
  
  console.log('Dice Results:');
  console.log('  Attack Dice:', attackDice.result);
  console.log('  Action Dice:', actionDice.result);
  
  // La IA considera los resultados de los dados
  const decision = alienAI.decideTurn(
    gameState,
    attackDice.result as any,
    actionDice.result as any
  );
  
  console.log('\nAI Decision:');
  console.log('  Action:', decision.action.type);
  console.log('  Reasoning:', decision.reasoning);
  
  return decision;
}

// ============================================================================
// EJEMPLO 3: DIFERENTES DIFICULTADES
// ============================================================================

/**
 * Ejemplo: Comparar decisiones entre diferentes dificultades
 */
export function compareAIDifficulties() {
  console.log('\n=== EJEMPLO 3: COMPARACIÓN DE DIFICULTADES ===\n');
  
  const gameState = createMockGameState();
  
  const difficulties = [
    DifficultyLevel.EASY,
    DifficultyLevel.NORMAL,
    DifficultyLevel.HARD,
    DifficultyLevel.EXPERT,
  ];
  
  difficulties.forEach(difficulty => {
    const ai = createAlienAI(difficulty);
    const decision = ai.decideTurn(gameState);
    
    console.log(`\n${difficulty}:`);
    console.log('  Action:', decision.action.type);
    console.log('  Score:', decision.heuristics.totalScore.toFixed(1));
    console.log('  Confidence:', (decision.confidence * 100).toFixed(1) + '%');
  });
}

// ============================================================================
// EJEMPLO 4: TURNO COMPLETO CON MOTOR DE REGLAS
// ============================================================================

/**
 * Ejemplo completo: Ejecutar un turno alienígena completo
 */
export function fullAlienTurnExample() {
  console.log('\n=== EJEMPLO 4: TURNO COMPLETO ===\n');
  
  // Crear motor y estado inicial
  const gameEngine = new GameEngine();
  let gameState = gameEngine.createInitialState({
    playerNames: ['Player 1', 'Player 2'],
    seed: 12345,
  });
  
  // Avanzar a fase alienígena (simulado)
  gameState = { ...gameState, phase: GamePhase.ALIEN_TURN };
  
  // Crear IA
  const alienAI = createAlienAI(DifficultyLevel.NORMAL);
  
  // Lanzar dados
  const rng = new RandomGenerator(gameState.rngSeed);
  const diceManager = new DiceManager();
  const attackDice = diceManager.roll(DiceType.ALIEN_ATTACK, rng);
  const actionDice = diceManager.roll(DiceType.ALIEN_ACTION, rng);
  
  console.log('Phase:', gameState.phase);
  console.log('Turn:', gameState.turn);
  console.log('Attack Dice:', attackDice.result);
  console.log('Action Dice:', actionDice.result);
  
  // IA decide
  const decision = alienAI.decideTurn(
    gameState,
    attackDice.result as any,
    actionDice.result as any
  );
  
  console.log('\nAI Decision:');
  console.log('  Action:', decision.action.type);
  console.log('  Reasoning:', decision.reasoning);
  console.log('  Confidence:', (decision.confidence * 100).toFixed(1) + '%');
  
  // Aplicar acción (en producción)
  // const result = gameEngine.applyAction(decision.action, gameState);
  // if (result.success) {
  //   gameState = result.newState;
  // }
  
  return { gameState, decision };
}

// ============================================================================
// EJEMPLO 5: CONFIGURACIÓN Y LOGGING
// ============================================================================

/**
 * Ejemplo: Configurar logging y analizar decisiones
 */
export function loggingExample() {
  console.log('\n=== EJEMPLO 5: LOGGING Y ANÁLISIS ===\n');
  
  // Configurar logger global
  configureAILogger({
    enabled: true,
    level: 'verbose',
    outputToConsole: true,
    storeInMemory: true,
    maxStoredLogs: 50,
  });
  
  // Crear IA
  const alienAI = createAlienAI(DifficultyLevel.HARD);
  const gameState = createMockGameState();
  
  // Ejecutar varias decisiones
  for (let i = 0; i < 3; i++) {
    console.log(`\n--- Turn ${i + 1} ---`);
    const decision = alienAI.decideTurn(gameState);
    // Logs se imprimen automáticamente
  }
  
  // Obtener estadísticas
  const stats = alienAI.getStatistics();
  console.log('\n=== STATISTICS ===');
  console.log('Total decisions:', stats.totalDecisions);
  console.log('Average confidence:', (stats.averageConfidence * 100).toFixed(1) + '%');
  console.log('Average execution time:', stats.averageExecutionTime.toFixed(1) + 'ms');
  console.log('Action distribution:', stats.actionTypeDistribution);
}

// ============================================================================
// EJEMPLO 6: MODO DETERMINISTA (TESTING)
// ============================================================================

/**
 * Ejemplo: IA determinista para testing
 */
export function deterministicExample() {
  console.log('\n=== EJEMPLO 6: MODO DETERMINISTA ===\n');
  
  // Crear IA determinista
  const ai = createDeterministicAlienAI(DifficultyLevel.NORMAL);
  
  // Crear dos estados idénticos
  const state1 = createMockGameState({ seed: 12345 });
  const state2 = createMockGameState({ seed: 12345 });
  
  // Obtener decisiones
  const decision1 = ai.decideTurn(state1);
  const decision2 = ai.decideTurn(state2);
  
  console.log('Decision 1 - Action:', decision1.action.type);
  console.log('Decision 1 - Score:', decision1.heuristics.totalScore.toFixed(2));
  
  console.log('\nDecision 2 - Action:', decision2.action.type);
  console.log('Decision 2 - Score:', decision2.heuristics.totalScore.toFixed(2));
  
  // Verificar determinismo
  const isDeterministic = 
    decision1.action.type === decision2.action.type &&
    decision1.heuristics.totalScore === decision2.heuristics.totalScore;
  
  console.log('\nIs Deterministic?', isDeterministic ? '✓ YES' : '✗ NO');
  
  return isDeterministic;
}

// ============================================================================
// EJEMPLO 7: INTEGRACIÓN CON MULTIPLAYER SERVER
// ============================================================================

/**
 * Ejemplo: Cómo integrar en un GameRoom multiplayer
 */
export class GameRoomWithAI {
  private gameState: GameState;
  private gameEngine: GameEngine;
  private alienAI: ReturnType<typeof createAlienAI> | null = null;
  private alienMode: 'human' | 'ai' = 'human';
  
  constructor() {
    this.gameEngine = new GameEngine();
    this.gameState = this.gameEngine.createInitialState({
      playerNames: ['Player 1', 'Player 2'],
      seed: Date.now(),
    });
  }
  
  /**
   * Habilitar IA alienígena para esta partida
   */
  enableAI(difficulty: DifficultyLevel) {
    this.alienMode = 'ai';
    this.alienAI = createAlienAI(difficulty);
    console.log(`AI enabled with difficulty: ${difficulty}`);
  }
  
  /**
   * Manejar turno alienígena
   */
  async handleAlienTurn() {
    if (this.gameState.phase !== GamePhase.ALIEN_TURN) {
      return;
    }
    
    if (this.alienMode === 'human') {
      // Esperar acción del jugador humano
      console.log('Waiting for human alien player...');
      return;
    }
    
    if (!this.alienAI) {
      throw new Error('AI not initialized');
    }
    
    // Lanzar dados
    const rng = new RandomGenerator(this.gameState.rngSeed);
    const diceManager = new DiceManager();
    const attackDice = diceManager.roll(DiceType.ALIEN_ATTACK, rng);
    const actionDice = diceManager.roll(DiceType.ALIEN_ACTION, rng);
    
    console.log('AI is thinking...');
    
    // La IA decide (con delay opcional para UX)
    await this.delay(500);
    const decision = this.alienAI.decideTurn(
      this.gameState,
      attackDice.result as any,
      actionDice.result as any
    );
    
    // Aplicar acción
    const result = this.gameEngine.applyAction(
      decision.action,
      this.gameState
    );
    
    if (result.success) {
      this.gameState = result.newState!;
      
      // Broadcast a clientes
      this.broadcastGameUpdate({
        state: this.gameState,
        alienAction: {
          type: decision.action.type,
          reasoning: decision.reasoning,
          confidence: decision.confidence,
          diceResults: {
            attack: attackDice.result,
            action: actionDice.result,
          },
        },
      });
    } else {
      console.error('Failed to apply AI action:', result.error);
    }
  }
  
  /**
   * Simula broadcast a clientes
   */
  private broadcastGameUpdate(data: any) {
    console.log('Broadcasting to clients:', {
      turn: data.state.turn,
      phase: data.state.phase,
      alienAction: data.alienAction.type,
      reasoning: data.alienAction.reasoning,
    });
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Ejemplo de uso del GameRoom con IA
 */
export async function gameRoomExample() {
  console.log('\n=== EJEMPLO 7: GAMEROOM CON IA ===\n');
  
  const room = new GameRoomWithAI();
  
  // Habilitar IA con dificultad Hard
  room.enableAI(DifficultyLevel.HARD);
  
  // Simular turno alienígena
  await room.handleAlienTurn();
}

// ============================================================================
// UTILIDADES DE TESTING
// ============================================================================

/**
 * Crea un estado de juego mock para testing
 */
function createMockGameState(options: { seed?: number } = {}): GameState {
  const gameEngine = new GameEngine();
  let state = gameEngine.createInitialState({
    playerNames: ['Player 1', 'Player 2'],
    seed: options.seed || Date.now(),
  });
  
  // Avanzar a fase alienígena
  state = { ...state, phase: GamePhase.ALIEN_TURN };
  
  return state;
}

// ============================================================================
// EJECUTAR EJEMPLOS
// ============================================================================

/**
 * Ejecutar todos los ejemplos
 */
export async function runAllExamples() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   JORUMI AI - EJEMPLOS DE USO         ║');
  console.log('╚════════════════════════════════════════╝');
  
  try {
    basicExample();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    exampleWithDice();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    compareAIDifficulties();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    fullAlienTurnExample();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // loggingExample(); // Comentado porque es muy verboso
    
    deterministicExample();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await gameRoomExample();
    
    console.log('\n✓ Todos los ejemplos completados\n');
  } catch (error) {
    console.error('\n✗ Error ejecutando ejemplos:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllExamples().catch(console.error);
}



