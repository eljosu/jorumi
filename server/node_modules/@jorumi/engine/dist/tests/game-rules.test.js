"use strict";
/**
 * JORUMI Game Engine - Game Rules Tests
 *
 * Tests unitarios de las reglas complejas del juego
 * Verifica la implementación fiel del manual
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.test_FoodConsumption_EnoughFood = test_FoodConsumption_EnoughFood;
exports.test_FoodConsumption_NotEnoughFood = test_FoodConsumption_NotEnoughFood;
exports.test_FoodConsumption_NoFood = test_FoodConsumption_NoFood;
exports.test_WoundedCare_EnoughMedicine = test_WoundedCare_EnoughMedicine;
exports.test_WoundedCare_NotEnoughMedicine = test_WoundedCare_NotEnoughMedicine;
exports.test_AlienControl_DisablesCharacters = test_AlienControl_DisablesCharacters;
exports.test_GhettoLiberation_EnablesCharacters = test_GhettoLiberation_EnablesCharacters;
exports.test_GameEnd_TotalDefeat = test_GameEnd_TotalDefeat;
exports.test_GameEnd_MothershipDestroyed = test_GameEnd_MothershipDestroyed;
exports.test_GameEnd_BeaconActivated = test_GameEnd_BeaconActivated;
exports.test_GameEnd_NoEndCondition = test_GameEnd_NoEndCondition;
exports.runAllTests = runAllTests;
const game_rules_1 = require("../rules/game-rules");
const types_1 = require("../domain/types");
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function createTestGhetto(overrides) {
    return {
        id: 'test-ghetto-1',
        name: 'Test Ghetto',
        tileId: 'test-tile-1',
        controlStatus: types_1.GhettoControlStatus.HUMAN,
        population: 10,
        wounded: 0,
        resources: {
            FOOD: 10,
            MEDICINE: 5,
            METAL: 3,
            MINERALS: 0,
        },
        buildings: [],
        characters: [],
        ...overrides,
    };
}
function createTestCharacter(overrides) {
    return {
        id: 'test-char-1',
        type: types_1.CharacterType.SOLDIER,
        name: 'Test Soldier',
        ghettoId: 'test-ghetto-1',
        tileId: undefined,
        isWounded: false,
        isUsed: false,
        canAct: true,
        ...overrides,
    };
}
// ============================================================================
// TEST: REGLAS DE SUPERVIVENCIA - COMIDA
// ============================================================================
function test_FoodConsumption_EnoughFood() {
    console.log('\n[TEST] Food Consumption - Enough Food');
    const ghetto = createTestGhetto({
        population: 10,
        wounded: 0,
        resources: {
            FOOD: 10, // Exactamente suficiente (10 humanos * 1 comida)
            MEDICINE: 5,
            METAL: 3,
            MINERALS: 0,
        },
    });
    const result = (0, game_rules_1.applyFoodConsumption)(ghetto);
    console.assert(result.deaths === 0, 'No deaths expected');
    console.assert(result.ghetto.resources.FOOD === 0, 'All food consumed');
    console.assert(result.ghetto.population === 10, 'Population unchanged');
    console.log('✓ PASSED: Humans survive with exact food');
}
function test_FoodConsumption_NotEnoughFood() {
    console.log('\n[TEST] Food Consumption - Not Enough Food');
    const ghetto = createTestGhetto({
        population: 10,
        wounded: 5,
        resources: {
            FOOD: 5, // Solo 5 comida para 15 humanos
            MEDICINE: 5,
            METAL: 3,
            MINERALS: 0,
        },
    });
    const result = (0, game_rules_1.applyFoodConsumption)(ghetto);
    console.assert(result.deaths > 0, 'Some deaths expected');
    console.assert(result.ghetto.resources.FOOD === 0, 'All food consumed');
    console.assert(result.ghetto.population + result.ghetto.wounded < 15, 'Total humans reduced');
    console.log(`✓ PASSED: ${result.deaths} humans died from starvation`);
}
function test_FoodConsumption_NoFood() {
    console.log('\n[TEST] Food Consumption - No Food');
    const ghetto = createTestGhetto({
        population: 10,
        wounded: 0,
        resources: {
            FOOD: 0, // Sin comida
            MEDICINE: 5,
            METAL: 3,
            MINERALS: 0,
        },
    });
    const result = (0, game_rules_1.applyFoodConsumption)(ghetto);
    console.assert(result.deaths > 0, 'Deaths expected');
    console.log(`✓ PASSED: ${result.deaths} humans died without food`);
}
// ============================================================================
// TEST: REGLAS DE SUPERVIVENCIA - MEDICINA
// ============================================================================
function test_WoundedCare_EnoughMedicine() {
    console.log('\n[TEST] Wounded Care - Enough Medicine');
    const ghetto = createTestGhetto({
        population: 10,
        wounded: 5,
        resources: {
            FOOD: 20,
            MEDICINE: 5, // Exactamente suficiente (5 heridos * 1 medicina)
            METAL: 3,
            MINERALS: 0,
        },
    });
    const result = (0, game_rules_1.applyWoundedCare)(ghetto);
    console.assert(result.deaths === 0, 'No deaths expected');
    console.assert(result.ghetto.wounded === 0, 'All wounded healed');
    console.assert(result.ghetto.population === 15, 'Population increased');
    console.assert(result.ghetto.resources.MEDICINE === 0, 'All medicine used');
    console.log('✓ PASSED: All wounded healed with sufficient medicine');
}
function test_WoundedCare_NotEnoughMedicine() {
    console.log('\n[TEST] Wounded Care - Not Enough Medicine');
    const ghetto = createTestGhetto({
        population: 10,
        wounded: 10,
        resources: {
            FOOD: 20,
            MEDICINE: 3, // Solo 3 medicinas para 10 heridos
            METAL: 3,
            MINERALS: 0,
        },
    });
    const result = (0, game_rules_1.applyWoundedCare)(ghetto);
    console.assert(result.deaths > 0, 'Some deaths expected');
    console.assert(result.ghetto.resources.MEDICINE === 0, 'All medicine used');
    const healed = 3; // 3 medicinas = 3 curados
    const remaining = 10 - healed; // 7 heridos restantes
    console.log(`✓ PASSED: ${healed} healed, ${result.deaths} died, ${result.ghetto.wounded} still wounded`);
}
// ============================================================================
// TEST: CONTROL ALIENÍGENA
// ============================================================================
function test_AlienControl_DisablesCharacters() {
    console.log('\n[TEST] Alien Control - Disables Characters');
    const ghetto = createTestGhetto({
        id: 'ghetto-1',
        controlStatus: types_1.GhettoControlStatus.HUMAN,
    });
    const characters = [
        createTestCharacter({ id: 'char-1', ghettoId: 'ghetto-1', canAct: true }),
        createTestCharacter({ id: 'char-2', ghettoId: 'ghetto-1', canAct: true }),
        createTestCharacter({ id: 'char-3', ghettoId: 'ghetto-2', canAct: true }), // Different ghetto
    ];
    const result = (0, game_rules_1.applyAlienControl)(ghetto, characters);
    console.assert(result.ghetto.controlStatus === types_1.GhettoControlStatus.ALIEN, 'Ghetto under alien control');
    const char1 = result.characters.find(c => c.id === 'char-1');
    const char2 = result.characters.find(c => c.id === 'char-2');
    const char3 = result.characters.find(c => c.id === 'char-3');
    console.assert(!char1.canAct, 'Character 1 disabled');
    console.assert(!char2.canAct, 'Character 2 disabled');
    console.assert(char3.canAct, 'Character 3 (different ghetto) still active');
    console.log('✓ PASSED: Alien control disables characters in controlled ghetto');
}
function test_GhettoLiberation_EnablesCharacters() {
    console.log('\n[TEST] Ghetto Liberation - Enables Characters');
    const ghetto = createTestGhetto({
        id: 'ghetto-1',
        controlStatus: types_1.GhettoControlStatus.ALIEN,
    });
    const characters = [
        createTestCharacter({ id: 'char-1', ghettoId: 'ghetto-1', canAct: false }),
        createTestCharacter({ id: 'char-2', ghettoId: 'ghetto-1', canAct: false }),
    ];
    const result = (0, game_rules_1.liberateGhetto)(ghetto, characters);
    console.assert(result.ghetto.controlStatus === types_1.GhettoControlStatus.HUMAN, 'Ghetto liberated');
    const char1 = result.characters.find(c => c.id === 'char-1');
    const char2 = result.characters.find(c => c.id === 'char-2');
    console.assert(char1.canAct, 'Character 1 enabled');
    console.assert(char2.canAct, 'Character 2 enabled');
    console.log('✓ PASSED: Liberation enables characters');
}
// ============================================================================
// TEST: CONDICIONES DE VICTORIA/DERROTA
// ============================================================================
function test_GameEnd_TotalDefeat() {
    console.log('\n[TEST] Game End - Total Defeat');
    // Mock de estado con 0 humanos
    const state = {
        ghettos: new Map([
            ['ghetto-1', createTestGhetto({ population: 0, wounded: 0 })],
            ['ghetto-2', createTestGhetto({ population: 0, wounded: 0 })],
        ]),
        alien: {
            mothershipHealth: 20,
        },
    };
    const result = (0, game_rules_1.checkGameEnd)(state);
    console.assert(result.isGameOver, 'Game should be over');
    console.assert(result.victoryCondition === 'TOTAL_DEFEAT', 'Total defeat condition');
    console.assert(result.winner === 'ALIEN', 'Alien wins');
    console.log('✓ PASSED: Total defeat detected correctly');
}
function test_GameEnd_MothershipDestroyed() {
    console.log('\n[TEST] Game End - Mothership Destroyed');
    const state = {
        ghettos: new Map([
            ['ghetto-1', createTestGhetto({ population: 10 })],
        ]),
        alien: {
            mothershipHealth: 0, // Nave destruida
        },
    };
    const result = (0, game_rules_1.checkGameEnd)(state);
    console.assert(result.isGameOver, 'Game should be over');
    console.assert(result.victoryCondition === 'MOTHERSHIP_DESTROYED', 'Mothership destroyed');
    console.assert(result.winner === 'HUMAN', 'Humans win');
    console.log('✓ PASSED: Mothership destruction detected correctly');
}
function test_GameEnd_BeaconActivated() {
    console.log('\n[TEST] Game End - Beacon Activated');
    const state = {
        ghettos: new Map([
            ['ghetto-1', createTestGhetto({
                    population: 10,
                    buildings: [types_1.BuildingType.BEACON],
                    controlStatus: types_1.GhettoControlStatus.HUMAN,
                })],
        ]),
        alien: {
            mothershipHealth: 20,
        },
    };
    const result = (0, game_rules_1.checkGameEnd)(state);
    console.assert(result.isGameOver, 'Game should be over');
    console.assert(result.victoryCondition === 'BEACON_ACTIVATED', 'Beacon activated');
    console.assert(result.winner === 'HUMAN', 'Humans win');
    console.log('✓ PASSED: Beacon activation detected correctly');
}
function test_GameEnd_NoEndCondition() {
    console.log('\n[TEST] Game End - No End Condition');
    const state = {
        ghettos: new Map([
            ['ghetto-1', createTestGhetto({ population: 10 })],
        ]),
        alien: {
            mothershipHealth: 20,
            hasAuxiliaryShip: true,
        },
    };
    const result = (0, game_rules_1.checkGameEnd)(state);
    console.assert(!result.isGameOver, 'Game should continue');
    console.log('✓ PASSED: Game continues when no end condition met');
}
// ============================================================================
// TEST RUNNER
// ============================================================================
function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   JORUMI GAME ENGINE - UNIT TESTS      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n--- SURVIVAL RULES: FOOD ---');
    test_FoodConsumption_EnoughFood();
    test_FoodConsumption_NotEnoughFood();
    test_FoodConsumption_NoFood();
    console.log('\n--- SURVIVAL RULES: MEDICINE ---');
    test_WoundedCare_EnoughMedicine();
    test_WoundedCare_NotEnoughMedicine();
    console.log('\n--- ALIEN CONTROL ---');
    test_AlienControl_DisablesCharacters();
    test_GhettoLiberation_EnablesCharacters();
    console.log('\n--- VICTORY/DEFEAT CONDITIONS ---');
    test_GameEnd_TotalDefeat();
    test_GameEnd_MothershipDestroyed();
    test_GameEnd_BeaconActivated();
    test_GameEnd_NoEndCondition();
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   ALL TESTS COMPLETED                  ║');
    console.log('╚════════════════════════════════════════╝\n');
}
// Si se ejecuta directamente
if (require.main === module) {
    runAllTests();
}
//# sourceMappingURL=game-rules.test.js.map