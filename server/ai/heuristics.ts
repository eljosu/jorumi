/**
 * JORUMI AI - Heuristics System
 * 
 * Funciones de evaluación heurística para la IA alienígena
 * Todas las funciones son puras y deterministas
 */

import {
  GameState,
  Ghetto,
  GhettoControlStatus,
  BuildingType,
  AlienState,
  Character,
} from '../../engine/domain/types';
import {
  GhettoThreatAssessment,
  GameStateAnalysis,
  HeuristicBreakdown,
  TacticalGoal,
} from './types';
import { calculateHexDistance } from '../../engine/utils/hex';
import { VICTORY_REQUIREMENTS, BUILDING_COSTS } from '../../engine/domain/constants';

// ============================================================================
// EVALUACIÓN DE GUETTOS
// ============================================================================

/**
 * Evalúa el nivel de amenaza de un guetto
 * Retorna puntuación 0-100
 */
export function evaluateGhettoThreat(
  ghetto: Ghetto,
  state: GameState,
  alienPosition?: string
): GhettoThreatAssessment {
  const { population, wounded, resources, buildings, controlStatus } = ghetto;
  
  // Calcular distancia desde la nave alienígena
  let distanceFromAlien = Infinity;
  if (alienPosition && state.tiles.has(alienPosition)) {
    const alienTile = state.tiles.get(alienPosition)!;
    const ghettoTile = state.tiles.get(ghetto.tileId);
    if (ghettoTile) {
      distanceFromAlien = calculateHexDistance(
        alienTile.coordinates,
        ghettoTile.coordinates
      );
    }
  }
  
  // Factores de amenaza
  const populationThreat = (population + wounded * 0.5) * 5; // Más humanos = más amenaza
  const resourceThreat = (resources.METAL + resources.MINERALS) * 3; // Recursos para victoria
  
  // Edificios peligrosos
  const hasBeacon = buildings.includes(BuildingType.BEACON);
  const hasBunker = buildings.includes(BuildingType.BUNKER);
  const hasHospital = buildings.includes(BuildingType.HOSPITAL);
  const buildingThreat = 
    (hasBeacon ? 40 : 0) +      // Baliza es condición de victoria
    (hasBunker ? 15 : 0) +       // Búnker reduce daño alienígena
    (hasHospital ? 10 : 0);      // Hospital recupera heridos
  
  // Proximidad aumenta amenaza
  const proximityMultiplier = distanceFromAlien < 3 ? 1.5 : 1.0;
  
  // Control alienígena reduce amenaza
  const controlMultiplier = controlStatus === GhettoControlStatus.ALIEN ? 0.3 : 1.0;
  
  const threatLevel = Math.min(100, 
    (populationThreat + resourceThreat + buildingThreat) * 
    proximityMultiplier * 
    controlMultiplier
  );
  
  // Valor estratégico (para captura)
  const strategicValue = evaluateGhettoStrategicValue(ghetto, state);
  
  return {
    ghettoId: ghetto.id,
    threatLevel,
    population,
    wounded,
    resources: {
      food: resources.FOOD,
      medicine: resources.MEDICINE,
      metal: resources.METAL,
      minerals: resources.MINERALS,
    },
    buildings: [...buildings],
    hasBeacon,
    hasBunker,
    hasHospital,
    controlStatus,
    distanceFromAlien,
    strategicValue,
  };
}

/**
 * Evalúa el valor estratégico de un guetto para control
 */
export function evaluateGhettoStrategicValue(
  ghetto: Ghetto,
  state: GameState
): number {
  let value = 0;
  
  // Recursos valiosos
  value += ghetto.resources.FOOD * 2;
  value += ghetto.resources.MEDICINE * 3;
  value += ghetto.resources.MINERALS * 5; // Minerales son objetivo alienígena
  
  // Población (controlar población = reducir fuerza humana)
  value += ghetto.population * 4;
  
  // Edificios estratégicos
  if (ghetto.buildings.includes(BuildingType.BEACON)) {
    value += 50; // Prevenir victoria humana
  }
  if (ghetto.buildings.includes(BuildingType.WORKSHOP)) {
    value += 15; // Impedir conversión de recursos
  }
  
  // Control actual
  if (ghetto.controlStatus === GhettoControlStatus.HUMAN) {
    value *= 1.5; // Más valioso capturar guettos humanos
  }
  
  return Math.min(100, value);
}

// ============================================================================
// ANÁLISIS GLOBAL DEL ESTADO
// ============================================================================

/**
 * Analiza el estado completo del juego desde perspectiva alienígena
 */
export function analyzeGameState(state: GameState): GameStateAnalysis {
  const { ghettos, alien, turn, phase, characters } = state;
  
  // Calcular estadísticas humanas
  let totalHumanPopulation = 0;
  let totalWounded = 0;
  let totalResources = 0;
  let beaconCount = 0;
  
  const ghettoAssessments: GhettoThreatAssessment[] = [];
  
  ghettos.forEach(ghetto => {
    totalHumanPopulation += ghetto.population;
    totalWounded += ghetto.wounded;
    totalResources += 
      ghetto.resources.FOOD + 
      ghetto.resources.MEDICINE + 
      ghetto.resources.METAL * 2 + 
      ghetto.resources.MINERALS * 3;
    
    if (ghetto.buildings.includes(BuildingType.BEACON)) {
      beaconCount++;
    }
    
    ghettoAssessments.push(
      evaluateGhettoThreat(ghetto, state, alien.currentTileId)
    );
  });
  
  // Fuerza de recursos humanos (0-100)
  const humanResourceStrength = Math.min(100, totalResources);
  
  // Nivel de amenaza humana (0-100)
  const humanThreatLevel = Math.min(100,
    (totalHumanPopulation * 3) +
    (beaconCount * 30) +
    (totalResources * 0.5)
  );
  
  // Progreso hacia victoria humana (0-100)
  const humanVictoryProgress = calculateHumanVictoryProgress(state);
  
  // Amenaza a la nave nodriza
  const mothershipUnderThreat = isMothershipUnderThreat(state);
  
  // Ordenar guettos por amenaza
  const sortedByThreat = [...ghettoAssessments].sort(
    (a, b) => b.threatLevel - a.threatLevel
  );
  
  // Identificar objetivos
  const primaryTarget = sortedByThreat[0]?.ghettoId;
  const secondaryTargets = sortedByThreat.slice(1, 3).map(g => g.ghettoId);
  const criticalThreats = ghettoAssessments
    .filter(g => g.hasBeacon || g.threatLevel > 70)
    .map(g => g.ghettoId);
  
  // Decisiones tácticas
  const shouldRetreat = alien.shieldLevel < 2 && humanThreatLevel > 60;
  const shouldAggress = alien.shieldLevel >= 4 && humanThreatLevel > 50;
  const shouldControl = alien.controlTokens > 0 && sortedByThreat[0]?.strategicValue > 40;
  const shouldBomb = beaconCount > 0 || (ghettos.size > 3 && humanResourceStrength > 60);
  
  return {
    turnNumber: turn,
    phase,
    totalHumanPopulation,
    totalWounded,
    humanResourceStrength,
    humanThreatLevel,
    humanVictoryProgress,
    alienShieldLevel: alien.shieldLevel,
    alienControlTokens: alien.controlTokens,
    mothershipHealth: alien.mothershipHealth,
    mothershipUnderThreat,
    ghettos: ghettoAssessments,
    primaryTarget,
    secondaryTargets,
    criticalThreats,
    shouldRetreat,
    shouldAggress,
    shouldControl,
    shouldBomb,
  };
}

/**
 * Calcula qué tan cerca están los humanos de ganar
 */
function calculateHumanVictoryProgress(state: GameState): number {
  let progress = 0;
  
  // Progreso hacia baliza
  state.ghettos.forEach(ghetto => {
    if (ghetto.buildings.includes(BuildingType.BEACON) && 
        ghetto.controlStatus === GhettoControlStatus.HUMAN) {
      progress = Math.max(progress, 80); // Baliza activa = muy cerca de ganar
    }
    // Cerca de construir baliza
    const hasResources = 
      ghetto.resources.METAL >= BUILDING_COSTS.BEACON.METAL &&
      ghetto.resources.MINERALS >= BUILDING_COSTS.BEACON.MINERALS;
    if (hasResources) {
      progress = Math.max(progress, 60);
    }
  });
  
  // Progreso hacia destruir nave nodriza
  const mothershipHealthPercent = 
    (state.alien.mothershipHealth / 20) * 100; // Asumiendo 20 HP inicial
  if (mothershipHealthPercent < 50) {
    progress = Math.max(progress, 70);
  }
  if (mothershipHealthPercent < 25) {
    progress = Math.max(progress, 90);
  }
  
  // Progreso hacia escape
  if (state.alien.hasAuxiliaryShip) {
    const totalHumans = Array.from(state.ghettos.values())
      .reduce((sum, g) => sum + g.population + g.wounded, 0);
    if (totalHumans >= VICTORY_REQUIREMENTS.ESCAPE_SHIP.minimumHumans) {
      progress = Math.max(progress, 75);
    }
  }
  
  return progress;
}

/**
 * Verifica si la nave nodriza está bajo amenaza inmediata
 */
function isMothershipUnderThreat(state: GameState): boolean {
  if (!state.alien.currentTileId) return false;
  
  const mothershipTile = state.tiles.get(state.alien.currentTileId);
  if (!mothershipTile) return false;
  
  // Verificar si hay personajes cerca
  let nearbyCharacters = 0;
  state.characters.forEach(char => {
    if (char.tileId) {
      const charTile = state.tiles.get(char.tileId);
      if (charTile) {
        const distance = calculateHexDistance(
          mothershipTile.coordinates,
          charTile.coordinates
        );
        if (distance <= 2) {
          nearbyCharacters++;
        }
      }
    }
  });
  
  return nearbyCharacters >= 2;
}

// ============================================================================
// HEURÍSTICAS DE ACCIONES ESPECÍFICAS
// ============================================================================

/**
 * Evalúa la heurística de atacar un guetto específico
 */
export function evaluateAttackAction(
  targetGhettoId: string,
  state: GameState,
  analysis: GameStateAnalysis
): HeuristicBreakdown {
  const ghetto = state.ghettos.get(targetGhettoId);
  if (!ghetto) {
    return createEmptyBreakdown();
  }
  
  const ghettoAssessment = analysis.ghettos.find(g => g.ghettoId === targetGhettoId);
  if (!ghettoAssessment) {
    return createEmptyBreakdown();
  }
  
  // Nivel de amenaza del objetivo
  const threatLevel = ghettoAssessment.threatLevel;
  
  // Oportunidad: población alta y poca defensa
  const opportunityScore = 
    (ghettoAssessment.population * 5) +
    (ghettoAssessment.hasBeacon ? 30 : 0) -
    (ghettoAssessment.hasBunker ? 15 : 0);
  
  // Valor estratégico
  const strategicValue = ghettoAssessment.strategicValue;
  
  // Evaluación de riesgo
  const riskAssessment = 
    100 - (ghettoAssessment.hasBunker ? 30 : 0) - 
    (ghettoAssessment.distanceFromAlien > 3 ? 20 : 0);
  
  // Progreso hacia victoria (reducir población humana)
  const victoryProgress = 
    (100 - analysis.humanVictoryProgress) + 
    (ghettoAssessment.population * 2);
  
  const totalScore = 
    (threatLevel * 0.3) +
    (opportunityScore * 0.25) +
    (strategicValue * 0.2) +
    (riskAssessment * 0.15) +
    (victoryProgress * 0.1);
  
  return {
    threatLevel,
    opportunityScore,
    strategicValue,
    riskAssessment,
    victoryProgress,
    totalScore,
  };
}

/**
 * Evalúa la heurística de controlar un guetto
 */
export function evaluateControlAction(
  targetGhettoId: string,
  state: GameState,
  analysis: GameStateAnalysis
): HeuristicBreakdown {
  const ghetto = state.ghettos.get(targetGhettoId);
  if (!ghetto || state.alien.controlTokens <= 0) {
    return createEmptyBreakdown();
  }
  
  const ghettoAssessment = analysis.ghettos.find(g => g.ghettoId === targetGhettoId);
  if (!ghettoAssessment) {
    return createEmptyBreakdown();
  }
  
  // Ya está controlado
  if (ghetto.controlStatus === GhettoControlStatus.ALIEN) {
    return createEmptyBreakdown();
  }
  
  const threatLevel = ghettoAssessment.threatLevel;
  const opportunityScore = ghettoAssessment.strategicValue;
  const strategicValue = 
    (ghettoAssessment.resources.food * 2) +
    (ghettoAssessment.resources.medicine * 3) +
    (ghettoAssessment.resources.minerals * 5) +
    (ghettoAssessment.hasBeacon ? 50 : 0);
  
  const riskAssessment = 
    100 - (ghettoAssessment.population > 5 ? 30 : 0);
  
  const victoryProgress = 
    (ghettoAssessment.hasBeacon ? 40 : 0) +
    (ghettoAssessment.population * 3);
  
  const totalScore = 
    (threatLevel * 0.2) +
    (opportunityScore * 0.3) +
    (strategicValue * 0.3) +
    (riskAssessment * 0.1) +
    (victoryProgress * 0.1);
  
  return {
    threatLevel,
    opportunityScore,
    strategicValue,
    riskAssessment,
    victoryProgress,
    totalScore,
  };
}

/**
 * Evalúa la heurística de bombardear una loseta
 */
export function evaluateBombAction(
  targetTileId: string,
  state: GameState,
  analysis: GameStateAnalysis
): HeuristicBreakdown {
  const tile = state.tiles.get(targetTileId);
  if (!tile || tile.destroyed) {
    return createEmptyBreakdown();
  }
  
  // Verificar si la loseta es un guetto con baliza
  let strategicValue = 10; // Valor base de destruir cualquier loseta
  let threatLevel = 0;
  
  // Encontrar guetto en esta loseta
  const ghettoOnTile = Array.from(state.ghettos.values())
    .find(g => g.tileId === targetTileId);
  
  if (ghettoOnTile) {
    const ghettoAssessment = analysis.ghettos.find(g => g.ghettoId === ghettoOnTile.id);
    if (ghettoAssessment) {
      if (ghettoAssessment.hasBeacon) {
        strategicValue = 100; // Destruir baliza es crítico
        threatLevel = 90;
      } else {
        strategicValue = 40; // Aislar guetto
        threatLevel = ghettoAssessment.threatLevel * 0.5;
      }
    }
  }
  
  // Aislar guettos (romper cadenas de suministro)
  const isolationValue = calculateIsolationValue(targetTileId, state);
  
  const opportunityScore = strategicValue + isolationValue;
  const riskAssessment = 100; // Bombardear es de bajo riesgo
  const victoryProgress = ghettoOnTile ? 50 : 20;
  
  const totalScore = 
    (threatLevel * 0.25) +
    (opportunityScore * 0.35) +
    (strategicValue * 0.25) +
    (riskAssessment * 0.05) +
    (victoryProgress * 0.1);
  
  return {
    threatLevel,
    opportunityScore,
    strategicValue,
    riskAssessment,
    victoryProgress,
    totalScore,
  };
}

/**
 * Calcula el valor de aislar guettos destruyendo una loseta
 */
function calculateIsolationValue(tileId: string, state: GameState): number {
  const tile = state.tiles.get(tileId);
  if (!tile) return 0;
  
  // Contar guettos adyacentes
  let adjacentGhettos = 0;
  state.ghettos.forEach(ghetto => {
    const ghettoTile = state.tiles.get(ghetto.tileId);
    if (ghettoTile) {
      const distance = calculateHexDistance(tile.coordinates, ghettoTile.coordinates);
      if (distance === 1) {
        adjacentGhettos++;
      }
    }
  });
  
  // Más guettos adyacentes = más valor de aislar
  return adjacentGhettos >= 2 ? adjacentGhettos * 15 : 0;
}

/**
 * Evalúa la heurística de moverse a una loseta
 */
export function evaluateMoveAction(
  targetTileId: string,
  state: GameState,
  analysis: GameStateAnalysis
): HeuristicBreakdown {
  const targetTile = state.tiles.get(targetTileId);
  if (!targetTile) {
    return createEmptyBreakdown();
  }
  
  // Encontrar guetto más cercano a la posición objetivo
  let closestGhettoDistance = Infinity;
  let closestGhettoThreat = 0;
  
  analysis.ghettos.forEach(ghettoAssessment => {
    const ghetto = state.ghettos.get(ghettoAssessment.ghettoId);
    if (ghetto) {
      const ghettoTile = state.tiles.get(ghetto.tileId);
      if (ghettoTile) {
        const distance = calculateHexDistance(
          targetTile.coordinates,
          ghettoTile.coordinates
        );
        if (distance < closestGhettoDistance) {
          closestGhettoDistance = distance;
          closestGhettoThreat = ghettoAssessment.threatLevel;
        }
      }
    }
  });
  
  // Retirarse a la nave nodriza si el escudo es bajo
  const isRetreatMove = 
    targetTile.type === 'ALIEN_SHIP' && 
    state.alien.shieldLevel < 2;
  
  const threatLevel = closestGhettoThreat;
  const opportunityScore = isRetreatMove ? 80 : (100 - closestGhettoDistance * 20);
  const strategicValue = isRetreatMove ? 70 : 30;
  const riskAssessment = isRetreatMove ? 100 : 50;
  const victoryProgress = 20;
  
  const totalScore = 
    (threatLevel * 0.2) +
    (opportunityScore * 0.3) +
    (strategicValue * 0.2) +
    (riskAssessment * 0.2) +
    (victoryProgress * 0.1);
  
  return {
    threatLevel,
    opportunityScore,
    strategicValue,
    riskAssessment,
    victoryProgress,
    totalScore,
  };
}

/**
 * Evalúa la heurística de escanear
 */
export function evaluateScanAction(
  targetTileId: string,
  state: GameState,
  analysis: GameStateAnalysis
): HeuristicBreakdown {
  // Escanear tiene valor bajo en general
  // Más útil en turnos tempranos o cuando hay poca información
  
  const explorationValue = state.turn < 5 ? 40 : 20;
  const informationValue = 30;
  
  return {
    threatLevel: 10,
    opportunityScore: explorationValue,
    strategicValue: informationValue,
    riskAssessment: 100, // Sin riesgo
    victoryProgress: 10,
    totalScore: 30, // Generalmente baja prioridad
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Crea un breakdown vacío (acción no válida)
 */
function createEmptyBreakdown(): HeuristicBreakdown {
  return {
    threatLevel: 0,
    opportunityScore: 0,
    strategicValue: 0,
    riskAssessment: 0,
    victoryProgress: 0,
    totalScore: 0,
  };
}

/**
 * Aplica ponderaciones de perfil de dificultad a un breakdown
 */
export function applyDifficultyWeights(
  breakdown: HeuristicBreakdown,
  weights: {
    threatResponse: number;
    opportunitySeizing: number;
    strategicPlanning: number;
    riskTaking: number;
    victoryFocus: number;
  }
): number {
  return (
    breakdown.threatLevel * weights.threatResponse +
    breakdown.opportunityScore * weights.opportunitySeizing +
    breakdown.strategicValue * weights.strategicPlanning +
    breakdown.riskAssessment * weights.riskTaking +
    breakdown.victoryProgress * weights.victoryFocus
  ) / 5; // Normalizar
}


