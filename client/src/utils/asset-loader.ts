/**
 * JORUMI - Asset Loader
 * 
 * Sistema centralizado de carga de assets 3D
 * - Cachea modelos cargados
 * - Preload de assets críticos
 * - Manejo de errores
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterType, ResourceType, DiceType } from '@engine/index';
import * as THREE from 'three';

// ============================================================================
// PATHS
// ============================================================================

const ASSET_BASE = '/assets/3d';

export const ASSET_PATHS = {
  characters: {
    [CharacterType.DOCTOR]: `${ASSET_BASE}/characters/doctor/char_doctor_01.glb`,
    [CharacterType.SOLDIER]: `${ASSET_BASE}/characters/soldier/char_soldier_01.glb`,
    [CharacterType.PEASANT]: `${ASSET_BASE}/characters/peasant/char_peasant_01.glb`,
    [CharacterType.CONSTRUCTOR]: `${ASSET_BASE}/characters/constructor/char_constructor_01.glb`,
    [CharacterType.MINER]: `${ASSET_BASE}/characters/miner/char_miner_01.glb`,
  },
  resources: {
    [ResourceType.FOOD]: `${ASSET_BASE}/resources/food/res_food_crate_01.glb`,
    [ResourceType.MEDICINE]: `${ASSET_BASE}/resources/medicine/res_medicine_case_01.glb`,
    [ResourceType.METAL]: `${ASSET_BASE}/resources/metal/res_metal_ingot_01.glb`,
    [ResourceType.MINERALS]: `${ASSET_BASE}/resources/minerals/res_mineral_crystal_01.glb`,
  },
  vehicles: {
    mothership: `${ASSET_BASE}/vehicles/mothership/veh_mothership_01.glb`,
    barca: `${ASSET_BASE}/vehicles/barca/veh_barca_01.glb`,
  },
  dice: {
    [DiceType.HUMAN_D6]: `${ASSET_BASE}/dice/dice_human_d6.glb`,
    [DiceType.ALIEN_ATTACK]: `${ASSET_BASE}/dice/dice_alien_attack.glb`,
    [DiceType.ALIEN_ACTION]: `${ASSET_BASE}/dice/dice_alien_action.glb`,
  },
};

// ============================================================================
// LOADER
// ============================================================================

class AssetManager {
  private loader: GLTFLoader;
  private cache: Map<string, any> = new Map();
  private loadingManager: THREE.LoadingManager;
  
  constructor() {
    this.loadingManager = new THREE.LoadingManager(
      () => console.log('[AssetManager] All assets loaded'),
      (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        console.log(`[AssetManager] Loading: ${progress.toFixed(0)}%`);
      },
      (url) => console.error(`[AssetManager] Error loading: ${url}`)
    );
    
    this.loader = new GLTFLoader(this.loadingManager);
  }
  
  /**
   * Carga un asset (con cache)
   */
  async load(path: string): Promise<any> {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.cache.set(path, gltf);
          console.log(`[AssetManager] Loaded: ${path}`);
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error(`[AssetManager] Failed to load: ${path}`, error);
          reject(error);
        }
      );
    });
  }
  
  /**
   * Preload de múltiples assets
   */
  async preloadAll(paths: string[]): Promise<void> {
    await Promise.all(paths.map((path) => this.load(path)));
  }
  
  /**
   * Obtiene un asset del cache (clonado para instanciar)
   */
  getClone(path: string): THREE.Object3D | null {
    const cached = this.cache.get(path);
    if (cached && cached.scene) {
      return cached.scene.clone();
    }
    return null;
  }
  
  /**
   * Limpia el cache
   */
  clear() {
    this.cache.clear();
  }
}

// Singleton
export const assetManager = new AssetManager();

// ============================================================================
// PRELOAD FUNCTIONS
// ============================================================================

/**
 * Preload de assets críticos (llamar al inicio)
 */
export async function preloadCriticalAssets() {
  const critical = [
    ...Object.values(ASSET_PATHS.characters),
    ASSET_PATHS.vehicles.mothership,
  ];
  
  await assetManager.preloadAll(critical);
}

/**
 * Preload de todos los assets
 */
export async function preloadAllAssets() {
  const all = [
    ...Object.values(ASSET_PATHS.characters),
    ...Object.values(ASSET_PATHS.resources),
    ...Object.values(ASSET_PATHS.vehicles),
    ...Object.values(ASSET_PATHS.dice),
  ];
  
  await assetManager.preloadAll(all);
}



