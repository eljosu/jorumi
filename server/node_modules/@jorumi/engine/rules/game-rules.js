"use strict";
/**
 * JORUMI Game Engine - Game Rules
 *
 * Reglas del juego implementadas como funciones puras
 * Manual: Implementación fiel de todas las mecánicas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILDING_EFFECTS = void 0;
exports.applyFoodConsumption = applyFoodConsumption;
exports.applyWoundedCare = applyWoundedCare;
exports.applyAlienControl = applyAlienControl;
exports.liberateGhetto = liberateGhetto;
exports.calculateCombatDamage = calculateCombatDamage;
exports.applyDamageToAlien = applyDamageToAlien;
exports.checkMothershipDestroyed = checkMothershipDestroyed;
exports.checkEscapeShip = checkEscapeShip;
exports.checkBeaconActivated = checkBeaconActivated;
exports.checkTotalDefeat = checkTotalDefeat;
exports.checkGameEnd = checkGameEnd;
exports.resetCharactersForNewTurn = resetCharactersForNewTurn;
exports.applySurvivalMechanics = applySurvivalMechanics;
const types_1 = require("../domain/types");
const constants_1 = require("../domain/constants");
const helpers_1 = require("../utils/helpers");
// ============================================================================
// REGLAS DE SUPERVIVENCIA
// ============================================================================
/**
 * Manual: Los humanos consumen comida cada turno
 * Si no hay suficiente comida, mueren humanos
 */
function applyFoodConsumption(ghetto) {
    const totalHumans = ghetto.population + ghetto.wounded;
    const foodNeeded = totalHumans * constants_1.SURVIVAL_MECHANICS.FOOD_CONSUMPTION_PER_HUMAN;
    const foodAvailable = ghetto.resources.FOOD;
    const newGhetto = { ...ghetto };
    if (foodAvailable >= foodNeeded) {
        // Hay suficiente comida
        newGhetto.resources = (0, helpers_1.subtractInventories)(ghetto.resources, { FOOD: foodNeeded });
        return {
            ghetto: newGhetto,
            deaths: 0,
            event: `${ghetto.name} consumed ${foodNeeded} food`,
        };
    }
    else {
        // No hay suficiente comida - algunos humanos mueren
        const shortage = foodNeeded - foodAvailable;
        const potentialDeaths = Math.ceil(shortage * constants_1.SURVIVAL_MECHANICS.STARVATION_DEATHS_RATIO);
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
function applyWoundedCare(ghetto) {
    if (ghetto.wounded === 0) {
        return {
            ghetto: { ...ghetto },
            deaths: 0,
            event: `${ghetto.name} has no wounded`,
        };
    }
    const medicineNeeded = ghetto.wounded * constants_1.SURVIVAL_MECHANICS.MEDICINE_TO_HEAL_ONE;
    const medicineAvailable = ghetto.resources.MEDICINE;
    const newGhetto = { ...ghetto };
    if (medicineAvailable >= medicineNeeded) {
        // Hay suficiente medicina - curar todos
        newGhetto.resources = (0, helpers_1.subtractInventories)(ghetto.resources, { MEDICINE: medicineNeeded });
        newGhetto.population += ghetto.wounded;
        newGhetto.wounded = 0;
        return {
            ghetto: newGhetto,
            deaths: 0,
            event: `${ghetto.name} healed all wounded (${ghetto.wounded})`,
        };
    }
    else {
        // Medicina insuficiente - algunos heridos mueren
        const healed = Math.floor(medicineAvailable / constants_1.SURVIVAL_MECHANICS.MEDICINE_TO_HEAL_ONE);
        const remaining = ghetto.wounded - healed;
        const deaths = Math.ceil(remaining * constants_1.SURVIVAL_MECHANICS.WOUNDED_TO_DEAD_RATIO);
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
function applyAlienControl(ghetto, characters) {
    const newGhetto = { ...ghetto, controlStatus: types_1.GhettoControlStatus.ALIEN };
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
function liberateGhetto(ghetto, characters) {
    const newGhetto = { ...ghetto, controlStatus: types_1.GhettoControlStatus.HUMAN };
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
exports.BUILDING_EFFECTS = {
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
        victoryCondition: types_1.VictoryCondition.BEACON_ACTIVATED,
    },
};
// ============================================================================
// REGLAS DE COMBATE
// ============================================================================
/**
 * Manual: Calcular daño en combate
 */
function calculateCombatDamage(attackerType, diceRoll, hasDefensiveBuilding) {
    let baseDamage = 0;
    switch (attackerType) {
        case types_1.CharacterType.SOLDIER:
            baseDamage = constants_1.CHARACTER_GATHERING_CAPACITY.SOLDIER.attackPower + diceRoll;
            break;
        default:
            baseDamage = diceRoll;
    }
    // Aplicar reducción por edificios defensivos
    if (hasDefensiveBuilding) {
        baseDamage = Math.max(0, baseDamage - exports.BUILDING_EFFECTS.BUNKER.damageReduction);
    }
    return baseDamage;
}
/**
 * Manual: Aplicar daño al escudo alienígena
 */
function applyDamageToAlien(currentShield, damage) {
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
function checkMothershipDestroyed(state) {
    return state.alien.mothershipHealth <= 0;
}
/**
 * Manual: Verificar condición de victoria - Escape en nave
 */
function checkEscapeShip(state) {
    // Debe haber nave auxiliar y suficientes humanos
    if (!state.alien.hasAuxiliaryShip) {
        return false;
    }
    let totalHumans = 0;
    state.ghettos.forEach(ghetto => {
        totalHumans += ghetto.population + ghetto.wounded;
    });
    return totalHumans >= constants_1.VICTORY_REQUIREMENTS.ESCAPE_SHIP.minimumHumans;
}
/**
 * Manual: Verificar condición de victoria - Baliza activada
 */
function checkBeaconActivated(state) {
    // Verificar si hay alguna baliza construida y activada
    for (const ghetto of state.ghettos.values()) {
        if (ghetto.buildings.includes('BEACON') &&
            ghetto.controlStatus === types_1.GhettoControlStatus.HUMAN) {
            return true;
        }
    }
    return false;
}
/**
 * Manual: Verificar condición de derrota - Todos los humanos muertos
 */
function checkTotalDefeat(state) {
    let totalHumans = 0;
    state.ghettos.forEach(ghetto => {
        totalHumans += ghetto.population + ghetto.wounded;
    });
    return totalHumans === 0;
}
/**
 * Verificar todas las condiciones de final de partida
 */
function checkGameEnd(state) {
    // Verificar derrota primero
    if (checkTotalDefeat(state)) {
        return {
            isGameOver: true,
            victoryCondition: types_1.VictoryCondition.TOTAL_DEFEAT,
            winner: types_1.PlayerRole.ALIEN,
        };
    }
    // Verificar victorias humanas
    if (checkMothershipDestroyed(state)) {
        return {
            isGameOver: true,
            victoryCondition: types_1.VictoryCondition.MOTHERSHIP_DESTROYED,
            winner: types_1.PlayerRole.HUMAN,
        };
    }
    if (checkBeaconActivated(state)) {
        return {
            isGameOver: true,
            victoryCondition: types_1.VictoryCondition.BEACON_ACTIVATED,
            winner: types_1.PlayerRole.HUMAN,
        };
    }
    if (checkEscapeShip(state)) {
        return {
            isGameOver: true,
            victoryCondition: types_1.VictoryCondition.ESCAPE_SHIP,
            winner: types_1.PlayerRole.HUMAN,
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
function resetCharactersForNewTurn(characters) {
    const newCharacters = new Map();
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
function applySurvivalMechanics(state) {
    const newGhettos = new Map();
    let totalDeaths = 0;
    const events = [];
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
//# sourceMappingURL=game-rules.js.map