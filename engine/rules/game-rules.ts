/**
 * JORUMI Game Engine - Game Rules
 * 
 * Reglas del juego implementadas como funciones puras
 * Manual: Implementación fiel de todas las mecánicas
 */

import { 
  GameState, 
  GhettoControlStatus, 
  VictoryCondition, 
  PlayerRole,
  Ghetto,
  Character,
  CharacterType,
} from '../domain/types';
import { 
  SURVIVAL_MECHANICS, 
  INITIAL_CONFIG, 
  VICTORY_REQUIREMENTS,
  CHARACTER_GATHERING_CAPACITY,
} from '../domain/constants';
import { cloneInventory, subtractInventories, addInventories } from '../utils/helpers';

// ============================================================================
// REGLAS DE SUPERVIVENCIA
// ============================================================================

/**
 * Manual: Los humanos consumen comida cada turno
 * Si no hay suficiente comida, mueren humanos
 */
export function applyFoodConsumption(ghetto: Ghetto): {
  ghetto: Ghetto;
  deaths: number;
  event: string;
} {
  const totalHumans = ghetto.population + ghetto.wounded;
  const foodNeeded = totalHumans * SURVIVAL_MECHANICS.FOOD_CONSUMPTION_PER_HUMAN;
  const foodAvailable = ghetto.resources.FOOD;
  
  const newGhetto = { ...ghetto };
  
  if (foodAvailable >= foodNeeded) {
    // Hay suficiente comida
    newGhetto.resources = subtractInventories(ghetto.resources, { FOOD: foodNeeded });
    return {
      ghetto: newGhetto,
      deaths: 0,
      event: `${ghetto.name} consumed ${foodNeeded} food`,
    };
  } else {
    // No hay suficiente comida - algunos humanos mueren
    const shortage = foodNeeded - foodAvailable;
    const potentialDeaths = Math.ceil(shortage * SURVIVAL_MECHANICS.STARVATION_DEATHS_RATIO);
    
    // Consumir toda la comida disponible
    newGhetto.resources = { ...ghetto.resources, FOOD: 0 };
    
    // Calcular muertes (primero heridos, luego sanos)
    let deaths = 0;
    let woundedDeaths = Math.min(potentialDeaths, newGhetto.wounded);
    let healthyDeaths = Math.max(0, potentialDeaths - woundedDeaths);
    
    newGhetto.wounded -= woundedDeaths;
    newGhetto.population -= healthyDeaths;
    deaths = woundedDeaths + healthyDeaths;
    
    return {
      ghetto: newGhetto,
      deaths,
      event: `${ghetto.name} suffered starvation: ${deaths} humans died`,
    };
  }
}

/**
 * Manual: Los heridos necesitan medicina o pueden morir
 */
export function applyWoundedCare(ghetto: Ghetto): {
  ghetto: Ghetto;
  deaths: number;
  event: string;
} {
  if (ghetto.wounded === 0) {
    return {
      ghetto: { ...ghetto },
      deaths: 0,
      event: `${ghetto.name} has no wounded`,
    };
  }
  
  const medicineNeeded = ghetto.wounded * SURVIVAL_MECHANICS.MEDICINE_TO_HEAL_ONE;
  const medicineAvailable = ghetto.resources.MEDICINE;
  
  const newGhetto = { ...ghetto };
  
  if (medicineAvailable >= medicineNeeded) {
    // Hay suficiente medicina - curar todos
    newGhetto.resources = subtractInventories(ghetto.resources, { MEDICINE: medicineNeeded });
    newGhetto.population += ghetto.wounded;
    newGhetto.wounded = 0;
    
    return {
      ghetto: newGhetto,
      deaths: 0,
      event: `${ghetto.name} healed all wounded (${ghetto.wounded})`,
    };
  } else {
    // Medicina insuficiente - algunos heridos mueren
    const healed = Math.floor(medicineAvailable / SURVIVAL_MECHANICS.MEDICINE_TO_HEAL_ONE);
    const remaining = ghetto.wounded - healed;
    const deaths = Math.ceil(remaining * SURVIVAL_MECHANICS.WOUNDED_TO_DEAD_RATIO);
    
    newGhetto.resources = { ...ghetto.resources, MEDICINE: 0 };
    newGhetto.population += healed;
    newGhetto.wounded = remaining - deaths;
    
    return {
      ghetto: newGhetto,
      deaths,
      event: `${ghetto.name} healed ${healed}, ${deaths} wounded died`,
    };
  }
}

// ============================================================================
// REGLAS DE CONTROL ALIENÍGENA
// ============================================================================

/**
 * Manual: Cuando un guetto es controlado por el alienígena
 * - Los personajes en ese guetto no pueden actuar
 * - Los recursos pueden ser robados
 * - Puede recuperarse mediante combate
 */
export function applyAlienControl(ghetto: Ghetto, characters: Character[]): {
  ghetto: Ghetto;
  characters: Character[];
} {
  const newGhetto = { ...ghetto, controlStatus: GhettoControlStatus.ALIEN };
  
  // Deshabilitar personajes en guetto controlado
  const newCharacters = characters.map(char => {
    if (char.ghettoId === ghetto.id) {
      return { ...char, canAct: false };
    }
    return char;
  });
  
  return {
    ghetto: newGhetto,
    characters: newCharacters,
  };
}

/**
 * Manual: Liberar guetto del control alienígena
 */
export function liberateGhetto(ghetto: Ghetto, characters: Character[]): {
  ghetto: Ghetto;
  characters: Character[];
} {
  const newGhetto = { ...ghetto, controlStatus: GhettoControlStatus.HUMAN };
  
  // Rehabilitar personajes
  const newCharacters = characters.map(char => {
    if (char.ghettoId === ghetto.id) {
      return { ...char, canAct: true };
    }
    return char;
  });
  
  return {
    ghetto: newGhetto,
    characters: newCharacters,
  };
}

// ============================================================================
// REGLAS DE CONSTRUCCIÓN
// ============================================================================

/**
 * Manual: Efectos de edificios construidos
 */
export const BUILDING_EFFECTS = {
  BUNKER: {
    description: 'Reduce el daño alienígena',
    damageReduction: 2,
  },
  HOSPITAL: {
    description: 'Permite curar más heridos por turno',
    healingBonus: 2,
  },
  WORKSHOP: {
    description: 'Permite convertir recursos',
    conversionsEnabled: true,
  },
  BEACON: {
    description: 'Condición de victoria - señal de rescate',
    victoryCondition: VictoryCondition.BEACON_ACTIVATED,
  },
};

// ============================================================================
// REGLAS DE COMBATE
// ============================================================================

/**
 * Manual: Calcular daño en combate
 */
export function calculateCombatDamage(
  attackerType: CharacterType,
  diceRoll: number,
  hasDefensiveBuilding: boolean
): number {
  let baseDamage = 0;
  
  switch (attackerType) {
    case CharacterType.SOLDIER:
      baseDamage = CHARACTER_GATHERING_CAPACITY.SOLDIER.attackPower + diceRoll;
      break;
    default:
      baseDamage = diceRoll;
  }
  
  // Aplicar reducción por edificios defensivos
  if (hasDefensiveBuilding) {
    baseDamage = Math.max(0, baseDamage - BUILDING_EFFECTS.BUNKER.damageReduction);
  }
  
  return baseDamage;
}

/**
 * Manual: Aplicar daño al escudo alienígena
 */
export function applyDamageToAlien(
  currentShield: number,
  damage: number
): {
  newShield: number;
  overflow: number;
} {
  const damageToShield = Math.min(damage, currentShield);
  const overflow = damage - damageToShield;
  
  return {
    newShield: currentShield - damageToShield,
    overflow,
  };
}

// ============================================================================
// REGLAS DE VICTORIA Y DERROTA
// ============================================================================

/**
 * Manual: Verificar condición de victoria - Nave nodriza destruida
 */
export function checkMothershipDestroyed(state: GameState): boolean {
  return state.alien.mothershipHealth <= 0;
}

/**
 * Manual: Verificar condición de victoria - Escape en nave
 */
export function checkEscapeShip(state: GameState): boolean {
  // Debe haber nave auxiliar y suficientes humanos
  if (!state.alien.hasAuxiliaryShip) {
    return false;
  }
  
  let totalHumans = 0;
  state.ghettos.forEach(ghetto => {
    totalHumans += ghetto.population + ghetto.wounded;
  });
  
  return totalHumans >= VICTORY_REQUIREMENTS.ESCAPE_SHIP.minimumHumans;
}

/**
 * Manual: Verificar condición de victoria - Baliza activada
 */
export function checkBeaconActivated(state: GameState): boolean {
  // Verificar si hay alguna baliza construida y activada
  for (const ghetto of state.ghettos.values()) {
    if (ghetto.buildings.includes('BEACON') && 
        ghetto.controlStatus === GhettoControlStatus.HUMAN) {
      return true;
    }
  }
  return false;
}

/**
 * Manual: Verificar condición de derrota - Todos los humanos muertos
 */
export function checkTotalDefeat(state: GameState): boolean {
  let totalHumans = 0;
  state.ghettos.forEach(ghetto => {
    totalHumans += ghetto.population + ghetto.wounded;
  });
  
  return totalHumans === 0;
}

/**
 * Verificar todas las condiciones de final de partida
 */
export function checkGameEnd(state: GameState): {
  isGameOver: boolean;
  victoryCondition?: VictoryCondition;
  winner?: PlayerRole;
} {
  // Verificar derrota primero
  if (checkTotalDefeat(state)) {
    return {
      isGameOver: true,
      victoryCondition: VictoryCondition.TOTAL_DEFEAT,
      winner: PlayerRole.ALIEN,
    };
  }
  
  // Verificar victorias humanas
  if (checkMothershipDestroyed(state)) {
    return {
      isGameOver: true,
      victoryCondition: VictoryCondition.MOTHERSHIP_DESTROYED,
      winner: PlayerRole.HUMAN,
    };
  }
  
  if (checkBeaconActivated(state)) {
    return {
      isGameOver: true,
      victoryCondition: VictoryCondition.BEACON_ACTIVATED,
      winner: PlayerRole.HUMAN,
    };
  }
  
  if (checkEscapeShip(state)) {
    return {
      isGameOver: true,
      victoryCondition: VictoryCondition.ESCAPE_SHIP,
      winner: PlayerRole.HUMAN,
    };
  }
  
  return { isGameOver: false };
}

// ============================================================================
// REGLAS DE FASE PREPARATION
// ============================================================================

/**
 * Manual: Al inicio de cada turno, resetear el estado de los personajes
 */
export function resetCharactersForNewTurn(characters: Map<string, Character>): Map<string, Character> {
  const newCharacters = new Map<string, Character>();
  
  characters.forEach((character, id) => {
    newCharacters.set(id, {
      ...character,
      isUsed: false,
    });
  });
  
  return newCharacters;
}

/**
 * Manual: Aplicar efectos de supervivencia en todos los guettos
 */
export function applySurvivalMechanics(state: GameState): {
  ghettos: Map<string, Ghetto>;
  totalDeaths: number;
  events: string[];
} {
  const newGhettos = new Map<string, Ghetto>();
  let totalDeaths = 0;
  const events: string[] = [];
  
  state.ghettos.forEach((ghetto, id) => {
    // Aplicar consumo de comida
    const foodResult = applyFoodConsumption(ghetto);
    let updatedGhetto = foodResult.ghetto;
    totalDeaths += foodResult.deaths;
    events.push(foodResult.event);
    
    // Aplicar cuidado de heridos
    const woundedResult = applyWoundedCare(updatedGhetto);
    updatedGhetto = woundedResult.ghetto;
    totalDeaths += woundedResult.deaths;
    events.push(woundedResult.event);
    
    newGhettos.set(id, updatedGhetto);
  });
  
  return {
    ghettos: newGhettos,
    totalDeaths,
    events,
  };
}



