# JORUMI - Sistema de IA Alienígena

Sistema de Inteligencia Artificial server-side para controlar al alienígena en el juego JORUMI.

## 📋 Tabla de Contenidos

- [Principios de Diseño](#principios-de-diseño)
- [Arquitectura](#arquitectura)
- [Uso Básico](#uso-básico)
- [Niveles de Dificultad](#niveles-de-dificultad)
- [Heurísticas](#heurísticas)
- [Integración con Multiplayer](#integración-con-multiplayer)
- [Logging y Debugging](#logging-y-debugging)
- [Testing](#testing)
- [Balance y Ajustes](#balance-y-ajustes)

## 🎯 Principios de Diseño

### Reglas Fundamentales

1. **La IA NO modifica el estado directamente**
   - Solo emite `PlayerAction` válidas
   - El estado se modifica únicamente por el motor de reglas

2. **La IA sigue las mismas reglas que un jugador humano**
   - Usa el mismo sistema de acciones
   - No tiene información oculta adicional
   - No altera resultados de dados

3. **Determinismo y Reproducibilidad**
   - Modo determinista para testing
   - Todas las decisiones son reproducibles con el mismo seed

4. **Explicabilidad**
   - Cada decisión genera logs detallados
   - Muestra heurísticas y reasoning
   - Útil para debugging y balance

## 🏗️ Arquitectura

```
AlienAIController (Controlador Principal)
├── AIStateEvaluator (Evaluación del Estado)
│   ├── Analiza amenazas humanas
│   ├── Identifica oportunidades
│   └── Evalúa progreso hacia victoria
│
├── ActionGenerator (Generación de Acciones)
│   ├── MOVE_ALIEN
│   ├── ALIEN_ATTACK
│   ├── ALIEN_CONTROL_GHETTO
│   ├── ALIEN_BOMB
│   └── ALIEN_SCAN
│
├── HeuristicEvaluator (Evaluación Heurística)
│   ├── Threat Level (nivel de amenaza)
│   ├── Opportunity Score (oportunidad)
│   ├── Strategic Value (valor estratégico)
│   ├── Risk Assessment (evaluación de riesgo)
│   └── Victory Progress (progreso a victoria)
│
└── ActionSelector (Selección de Acción)
    ├── Aplica ponderaciones de dificultad
    ├── Introduce aleatoriedad según perfil
    └── Selecciona mejor acción
```

## 🚀 Uso Básico

### Creación de la IA

```typescript
import { createAlienAI, DifficultyLevel } from './ai';

// Crear IA con dificultad normal
const ai = createAlienAI(DifficultyLevel.NORMAL);

// O crear con configuración personalizada
const customAI = new AlienAIController({
  difficulty: DifficultyLevel.HARD,
  enableLogging: true,
  logVerbosity: 'verbose',
  deterministicMode: false,
  decisionDelayMs: 500,
});
```

### Uso en el Turno Alienígena

```typescript
import { GameState, GamePhase } from '../../engine/domain/types';
import { createAlienAI, DifficultyLevel } from './ai';

// Crear IA
const alienAI = createAlienAI(DifficultyLevel.NORMAL);

// En el turno alienígena (ALIEN_TURN phase)
function handleAlienTurn(gameState: GameState) {
  // Verificar fase
  if (gameState.phase !== GamePhase.ALIEN_TURN) {
    console.error('Not alien turn phase');
    return;
  }
  
  // La IA decide qué hacer
  const decision = alienAI.decideTurn(gameState);
  
  // Extraer la acción
  const action = decision.action;
  
  // Aplicar la acción a través del motor de reglas
  const result = gameEngine.applyAction(action, gameState);
  
  if (result.success) {
    // Actualizar estado
    const newState = result.newState;
    
    // Emitir eventos a clientes
    broadcastGameEvent({
      type: 'ALIEN_ACTION',
      action: action.type,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
    });
    
    return newState;
  } else {
    console.error('Failed to apply AI action:', result.error);
  }
}
```

### Ejemplo Completo con Dados

```typescript
import { DiceManager, DiceType } from '../../engine/dice/dice';
import { RandomGenerator } from '../../engine/dice/rng';

function executeAlienTurnWithDice(gameState: GameState) {
  const rng = new RandomGenerator(gameState.rngSeed);
  const diceManager = new DiceManager();
  
  // 1. Lanzar dados alienígenas
  const attackDice = diceManager.roll(DiceType.ALIEN_ATTACK, rng);
  const actionDice = diceManager.roll(DiceType.ALIEN_ACTION, rng);
  
  console.log('Attack Dice:', attackDice.result);
  console.log('Action Dice:', actionDice.result);
  
  // 2. La IA decide basándose en los dados
  const decision = alienAI.decideTurn(
    gameState,
    attackDice.result as AlienAttackFace,
    actionDice.result as AlienActionFace
  );
  
  // 3. Aplicar acción
  return gameEngine.applyAction(decision.action, gameState);
}
```

## 🎚️ Niveles de Dificultad

### EASY (Fácil)

```typescript
const easyAI = createAlienAI(DifficultyLevel.EASY);
```

- **Comportamiento**: Errático y poco planificado
- **Aleatoriedad**: 50%
- **Anticipación**: 0 turnos
- **Agresividad**: 40%
- **Ideal para**: Jugadores nuevos aprendiendo el juego

**Características:**
- Decisiones casi aleatorias
- Baja respuesta a amenazas
- No bloquea condiciones de victoria
- Comete errores frecuentes

### NORMAL (Normal)

```typescript
const normalAI = createAlienAI(DifficultyLevel.NORMAL);
```

- **Comportamiento**: Equilibrado y competente
- **Aleatoriedad**: 20%
- **Anticipación**: 1 turno
- **Agresividad**: 60%
- **Ideal para**: Partidas estándar

**Características:**
- Heurísticas básicas
- Reacción al estado actual
- Balance entre ataque y defensa
- Errores ocasionales

### HARD (Difícil)

```typescript
const hardAI = createAlienAI(DifficultyLevel.HARD);
```

- **Comportamiento**: Planificado y táctico
- **Aleatoriedad**: 10%
- **Anticipación**: 2 turnos
- **Agresividad**: 80%
- **Ideal para**: Jugadores experimentados

**Características:**
- Planificación a medio plazo
- Bloqueo activo de victorias humanas
- Alta priorización de amenazas
- Pocos errores

### EXPERT (Experto)

```typescript
const expertAI = createAlienAI(DifficultyLevel.EXPERT);
```

- **Comportamiento**: Óptimo y agresivo
- **Aleatoriedad**: 0%
- **Anticipación**: 3 turnos
- **Agresividad**: 100%
- **Ideal para**: Máximo desafío

**Características:**
- Decisiones matemáticamente óptimas
- Sin errores
- Máxima presión sobre humanos
- Bloqueo preventivo de victorias

## 🧮 Heurísticas

### Sistema de Evaluación

Cada acción se evalúa en 5 dimensiones:

#### 1. Threat Level (Nivel de Amenaza)

Evalúa qué tan peligroso es un objetivo para el alienígena.

**Factores:**
- Población del guetto (más población = más amenaza)
- Presencia de baliza (amenaza crítica)
- Recursos para victoria (metal, minerales)
- Edificios defensivos (búnker)
- Proximidad a la nave alienígena

**Ejemplo:**
```typescript
const threatScore = 
  (population * 5) +
  (hasBeacon ? 40 : 0) +
  (hasBunker ? 15 : 0) +
  (resources.METAL + resources.MINERALS) * 3;
```

#### 2. Opportunity Score (Oportunidad)

Evalúa el potencial beneficio de una acción.

**Factores:**
- Población vulnerable (heridos)
- Recursos robables
- Guettos con baja defensa
- Posibilidad de control

**Ejemplo:**
```typescript
const opportunityScore = 
  (population * 5) +
  (wounded * 3) +
  (hasBeacon ? 30 : 0) -
  (hasBunker ? 15 : 0);
```

#### 3. Strategic Value (Valor Estratégico)

Evalúa el valor a largo plazo de una acción.

**Factores:**
- Control de recursos críticos
- Aislamiento de guettos
- Prevención de condiciones de victoria
- Posicionamiento táctico

**Ejemplo:**
```typescript
const strategicValue = 
  (resources.MINERALS * 5) +
  (resources.MEDICINE * 3) +
  (hasBeacon ? 50 : 0) +
  (population * 4);
```

#### 4. Risk Assessment (Evaluación de Riesgo)

Evalúa el riesgo de una acción.

**Factores:**
- Defensa del objetivo
- Distancia desde posición actual
- Escudo alienígena actual
- Posibles contraataques

**Ejemplo:**
```typescript
const riskAssessment = 
  100 - 
  (hasBunker ? 30 : 0) -
  (distance > 3 ? 20 : 0) -
  (alienShield < 2 ? 30 : 0);
```

#### 5. Victory Progress (Progreso a Victoria)

Evalúa cuánto acerca la acción a la victoria alienígena.

**Factores:**
- Reducción de población humana
- Prevención de victorias humanas
- Control territorial
- Robo de minerales

**Ejemplo:**
```typescript
const victoryProgress = 
  (100 - humanVictoryProgress) +
  (population * 2) +
  (hasBeacon ? 40 : 0);
```

### Ponderación por Dificultad

Las heurísticas se ponderan según el perfil de dificultad:

| Heurística | Easy | Normal | Hard | Expert |
|------------|------|--------|------|--------|
| Threat Response | 0.3 | 0.5 | 0.7 | 0.9 |
| Opportunity Seizing | 0.5 | 0.6 | 0.8 | 0.9 |
| Strategic Planning | 0.2 | 0.4 | 0.7 | 0.9 |
| Risk Taking | 0.6 | 0.5 | 0.4 | 0.3 |
| Victory Focus | 0.3 | 0.5 | 0.8 | 1.0 |

## 🌐 Integración con Multiplayer

### En el Servidor (GameRoom)

```typescript
import { createAlienAI, DifficultyLevel } from '../ai';

class GameRoom {
  private alienAI: AlienAIController | null = null;
  
  // Habilitar IA para esta partida
  enableAlienAI(difficulty: DifficultyLevel) {
    this.alienAI = createAlienAI(difficulty);
  }
  
  // En el turno alienígena
  async handleAlienTurn() {
    if (!this.alienAI) {
      // Esperar input del jugador alienígena humano
      return;
    }
    
    // La IA decide
    const decision = this.alienAI.decideTurn(this.gameState);
    
    // Aplicar acción
    const result = this.gameEngine.applyAction(
      decision.action,
      this.gameState
    );
    
    if (result.success) {
      this.gameState = result.newState;
      
      // Broadcast a todos los clientes
      this.broadcastToAll({
        type: 'GAME_STATE_UPDATE',
        state: this.gameState,
        alienAction: {
          type: decision.action.type,
          reasoning: decision.reasoning,
          confidence: decision.confidence,
        },
      });
    }
  }
}
```

### Configuración de Partida

```typescript
interface GameRoomConfig {
  alienMode: 'human' | 'ai';
  aiDifficulty?: DifficultyLevel;
}

function createGame(config: GameRoomConfig) {
  const room = new GameRoom();
  
  if (config.alienMode === 'ai') {
    room.enableAlienAI(config.aiDifficulty || DifficultyLevel.NORMAL);
  }
  
  return room;
}
```

## 📊 Logging y Debugging

### Configuración del Logger

```typescript
import { configureAILogger } from './ai';

// Configurar logging global
configureAILogger({
  enabled: true,
  level: 'verbose', // 'minimal' | 'normal' | 'verbose'
  outputToConsole: true,
  storeInMemory: true,
  maxStoredLogs: 100,
});
```

### Niveles de Logging

#### Minimal
```
🤖 ALIEN AI DECISION - Turn 3 - Phase: ALIEN_TURN
📋 ACTION: Alien Attack
   Confidence: 85.3%
   Difficulty: NORMAL
```

#### Normal
```
🤖 ALIEN AI DECISION - Turn 3 - Phase: ALIEN_TURN
📋 ACTION: Alien Attack
   Confidence: 85.3%
   Difficulty: NORMAL

💭 REASONING:
   Attack ghetto GHETTO_1: beacon detected (critical threat), high population

📊 HEURISTICS:
   Threat Level:      87.5
   Opportunity:       72.3
   Strategic Value:   91.0
   Risk Assessment:   65.0
   Victory Progress:  78.2
   ─────────────────────────────
   TOTAL SCORE:       79.8

⏱️  Execution time: 12ms
```

#### Verbose
Incluye además:
- Análisis completo del estado
- Evaluación de todos los guettos
- Decisiones tácticas
- Top 3 acciones alternativas

### Obtener Estadísticas

```typescript
const stats = alienAI.getStatistics();

console.log('Total decisions:', stats.totalDecisions);
console.log('Average confidence:', stats.averageConfidence);
console.log('Average execution time:', stats.averageExecutionTime);
console.log('Action distribution:', stats.actionTypeDistribution);
```

### Exportar Logs

```typescript
import { getAILogger } from './ai';

const logger = getAILogger();

// Exportar a JSON
const logsJSON = logger.exportToJSON();
fs.writeFileSync('ai-logs.json', logsJSON);

// Obtener logs de un turno específico
const turn5Logs = logger.getLogsByTurn(5);
```

## 🧪 Testing

### Test con IA Determinista

```typescript
import { createDeterministicAlienAI } from './ai';

describe('Alien AI', () => {
  it('should make consistent decisions with same seed', () => {
    const ai = createDeterministicAlienAI(DifficultyLevel.NORMAL);
    
    const state1 = createTestGameState({ seed: 12345 });
    const state2 = createTestGameState({ seed: 12345 });
    
    const decision1 = ai.decideTurn(state1);
    const decision2 = ai.decideTurn(state2);
    
    expect(decision1.action.type).toBe(decision2.action.type);
  });
});
```

### Test de Heurísticas

```typescript
import { evaluateGhettoThreat, analyzeGameState } from './ai';

describe('Heuristics', () => {
  it('should identify beacon as critical threat', () => {
    const state = createStateWithBeacon();
    const analysis = analyzeGameState(state);
    
    const beaconGhetto = analysis.ghettos.find(g => g.hasBeacon);
    expect(beaconGhetto.threatLevel).toBeGreaterThan(80);
  });
});
```

## ⚖️ Balance y Ajustes

### Puntos de Ajuste

#### 1. Ponderaciones de Heurísticas

Archivo: `difficulty-profiles.ts`

```typescript
// Ajustar comportamiento de dificultad NORMAL
export const NORMAL_PROFILE: DifficultyProfile = {
  // ...
  weights: {
    threatResponse: 0.5,        // ↑ Más defensivo
    opportunitySeizing: 0.6,    // ↑ Más oportunista
    strategicPlanning: 0.4,     // ↑ Más planificado
    riskTaking: 0.5,            // ↓ Más cauteloso
    victoryFocus: 0.5,          // ↑ Más agresivo
  },
};
```

#### 2. Valores de Heurísticas

Archivo: `heuristics.ts`

```typescript
// Ajustar importancia de balizas
if (ghetto.buildings.includes(BuildingType.BEACON)) {
  value += 50; // Aumentar para que la IA las priorice más
}

// Ajustar valor de población
value += ghetto.population * 4; // Aumentar multiplicador
```

#### 3. Umbrales de Decisión

```typescript
// En heuristics.ts
const shouldRetreat = 
  alien.shieldLevel < 2 && // Cambiar umbral
  humanThreatLevel > 60;   // Cambiar umbral
```

### Testing de Balance

```typescript
// Crear múltiples partidas con diferentes dificultades
function testAIBalance() {
  const difficulties = [
    DifficultyLevel.EASY,
    DifficultyLevel.NORMAL,
    DifficultyLevel.HARD,
    DifficultyLevel.EXPERT,
  ];
  
  difficulties.forEach(difficulty => {
    const ai = createAlienAI(difficulty);
    const results = [];
    
    // Simular 100 partidas
    for (let i = 0; i < 100; i++) {
      const game = simulateFullGame(ai);
      results.push({
        winner: game.winner,
        turns: game.totalTurns,
        finalPopulation: game.finalHumanPopulation,
      });
    }
    
    console.log(`Difficulty: ${difficulty}`);
    console.log('Alien win rate:', 
      results.filter(r => r.winner === 'ALIEN').length / 100
    );
    console.log('Average turns:', 
      results.reduce((sum, r) => sum + r.turns, 0) / 100
    );
  });
}
```

### Métricas de Balance Ideal

| Dificultad | Win Rate Alienígena | Turnos Promedio | Población Final |
|------------|---------------------|-----------------|-----------------|
| Easy       | 20-30%              | 15-20           | 8-12            |
| Normal     | 40-50%              | 12-18           | 5-9             |
| Hard       | 60-70%              | 10-15           | 2-6             |
| Expert     | 75-85%              | 8-12            | 0-3             |

## 📝 Notas Finales

### Próximas Mejoras

1. **Evaluación Multi-Turno**
   - Implementar lookahead para dificultades altas
   - Simular consecuencias de acciones

2. **Aprendizaje de Patrones**
   - Detectar estrategias humanas recurrentes
   - Adaptar táctica durante la partida

3. **Coordinación de Acciones**
   - Planificar secuencias de múltiples turnos
   - Optimizar uso de dados

4. **Personalización**
   - Perfiles de IA personalizables
   - API para ajustar comportamiento en runtime

### Contribuir

Para ajustar el balance de la IA:
1. Modificar heurísticas en `heuristics.ts`
2. Ajustar ponderaciones en `difficulty-profiles.ts`
3. Probar con diferentes seeds
4. Analizar logs para verificar reasoning
5. Iterar hasta balance deseado

---

**Diseñado por**: Sistema de IA JORUMI  
**Versión**: 1.0.0  
**Licencia**: MIT


