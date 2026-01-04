/**
 * JORUMI Game Engine - Game Constants
 *
 * Constantes del juego según el manual oficial
 */
export declare const INITIAL_CONFIG: {
    readonly STARTING_GHETTOS: 2;
    readonly STARTING_POPULATION_PER_GHETTO: 10;
    readonly STARTING_CHARACTERS_PER_TYPE: 1;
    readonly INITIAL_RESOURCES: {
        readonly FOOD: 5;
        readonly MEDICINE: 3;
        readonly METAL: 2;
        readonly MINERALS: 0;
    };
    readonly ALIEN_INITIAL_SHIELD: 3;
    readonly ALIEN_INITIAL_CONTROL_TOKENS: 2;
    readonly MOTHERSHIP_INITIAL_HEALTH: 20;
    readonly MOTHERSHIP_INITIAL_SHIELD: 5;
};
/**
 * Manual: Costos de recursos para construir edificios
 */
export declare const BUILDING_COSTS: {
    readonly BUNKER: {
        readonly METAL: 3;
        readonly FOOD: 0;
        readonly MEDICINE: 0;
        readonly MINERALS: 0;
    };
    readonly HOSPITAL: {
        readonly METAL: 2;
        readonly MEDICINE: 2;
        readonly FOOD: 0;
        readonly MINERALS: 0;
    };
    readonly WORKSHOP: {
        readonly METAL: 4;
        readonly FOOD: 0;
        readonly MEDICINE: 0;
        readonly MINERALS: 0;
    };
    readonly BEACON: {
        readonly METAL: 5;
        readonly MINERALS: 3;
        readonly FOOD: 0;
        readonly MEDICINE: 0;
    };
};
/**
 * Manual: Capacidades de recolección por tipo de personaje
 */
export declare const CHARACTER_GATHERING_CAPACITY: {
    readonly PEASANT: {
        readonly FOOD: 3;
    };
    readonly MINER: {
        readonly MINERALS: 2;
        readonly METAL: 2;
    };
    readonly DOCTOR: {
        readonly healsPerAction: 2;
    };
    readonly SOLDIER: {
        readonly attackPower: 3;
    };
    readonly CONSTRUCTOR: {
        readonly buildSpeed: 1;
    };
};
/**
 * Manual: Consumo de comida y mecánicas de supervivencia
 */
export declare const SURVIVAL_MECHANICS: {
    readonly FOOD_CONSUMPTION_PER_HUMAN: 1;
    readonly STARVATION_DEATHS_RATIO: 0.5;
    readonly MEDICINE_TO_HEAL_ONE: 1;
    readonly WOUNDED_TO_DEAD_RATIO: 0.3;
};
/**
 * Manual: Mecánicas de combate y daño
 */
export declare const COMBAT_MECHANICS: {
    readonly SOLDIER_BASE_ATTACK: 3;
    readonly ALIEN_BASE_DEFENSE: 2;
    readonly SHIELD_DAMAGE_REDUCTION: 1;
    readonly MOTHERSHIP_CRITICAL_HIT_CHANCE: 0.16;
    readonly BOMB_DESTROYS_TILE: true;
};
/**
 * Manual: Reglas de movimiento en mapa hexagonal
 */
export declare const MOVEMENT_RULES: {
    readonly CHARACTER_MOVE_RANGE: 2;
    readonly ALIEN_MOVE_RANGE: 3;
    readonly ADJACENT_DISTANCE: 1;
};
/**
 * Manual: Requisitos para cada condición de victoria
 */
export declare const VICTORY_REQUIREMENTS: {
    readonly MOTHERSHIP_DESTROYED: {
        readonly mothershipHealth: 0;
    };
    readonly ESCAPE_SHIP: {
        readonly minimumHumans: 5;
        readonly requiresAuxiliaryShip: true;
    };
    readonly BEACON_ACTIVATED: {
        readonly requiresBeacon: true;
        readonly turnsToWait: 3;
    };
    readonly TOTAL_DEFEAT: {
        readonly maximumHumans: 0;
    };
};
/**
 * Manual: Conversiones posibles en el taller (workshop)
 */
export declare const WORKSHOP_CONVERSIONS: readonly [{
    readonly name: "Metal to Minerals";
    readonly input: {
        readonly METAL: 2;
    };
    readonly output: {
        readonly MINERALS: 1;
    };
}, {
    readonly name: "Food to Medicine";
    readonly input: {
        readonly FOOD: 3;
    };
    readonly output: {
        readonly MEDICINE: 1;
    };
}];
/**
 * Manual: Configuración de caras de dados personalizados
 */
export declare const DICE_CONFIGURATION: {
    readonly ALIEN_ATTACK_FACES: readonly ["SHIELD", "SHIELD", "CONTROL", "ATTACK", "ATTACK", "DOUBLE_ATTACK"];
    readonly ALIEN_ACTION_FACES: readonly ["MOVE", "MOVE", "SCAN", "SCAN", "BOMB", "SPECIAL"];
    readonly STANDARD_D6_FACES: readonly [1, 2, 3, 4, 5, 6];
    readonly COMBAT_D6_FACES: readonly [1, 2, 3, 4, 5, 6];
};
export declare const GAME_LIMITS: {
    readonly MAX_TILES: 50;
    readonly MAX_GHETTOS: 5;
    readonly MAX_CHARACTERS_PER_TYPE: 3;
    readonly MAX_BUILDINGS_PER_GHETTO: 4;
    readonly MAX_TURNS: 50;
    readonly MAX_ALIEN_SHIELD: 6;
    readonly MAX_CONTROL_TOKENS: 5;
};
//# sourceMappingURL=constants.d.ts.map