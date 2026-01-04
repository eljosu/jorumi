/**
 * JORUMI Asset Loader Utility
 * 
 * Sistema centralizado para cargar y gestionar assets 3D
 * con caché, preloading y progreso de carga.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CharacterType, ResourceType, DiceType } from '../../../engine/domain/types';

// ============================================================================
// TYPES
// ============================================================================

export interface LoadProgress {
  url: string;
  loaded: number;
  total: number;
  percentage: number;
}

export interface AssetMetadata {
  path: string;
  type: 'character' | 'resource' | 'vehicle' | 'dice' | 'building' | 'tile';
  size?: number;
  preload?: boolean;
}

export type AssetCache = Map<string, THREE.Group>;

// ============================================================================
// ASSET REGISTRY
// ============================================================================

export const ASSET_REGISTRY = {
  characters: {
    [CharacterType.DOCTOR]: {
      path: '/assets/3d/characters/doctor/char_doctor_01.glb',
      type: 'character',
      preload: true,
    },
    [CharacterType.SOLDIER]: {
      path: '/assets/3d/characters/soldier/char_soldier_01.glb',
      type: 'character',
      preload: true,
    },
    [CharacterType.PEASANT]: {
      path: '/assets/3d/characters/peasant/char_peasant_01.glb',
      type: 'character',
      preload: true,
    },
    [CharacterType.CONSTRUCTOR]: {
      path: '/assets/3d/characters/constructor/char_constructor_01.glb',
      type: 'character',
      preload: true,
    },
    [CharacterType.MINER]: {
      path: '/assets/3d/characters/miner/char_miner_01.glb',
      type: 'character',
      preload: true,
    },
  },
  
  resources: {
    [ResourceType.FOOD]: {
      path: '/assets/3d/resources/food/res_food_crate_01.glb',
      type: 'resource',
      preload: true,
    },
    [ResourceType.MEDICINE]: {
      path: '/assets/3d/resources/medicine/res_medicine_case_01.glb',
      type: 'resource',
      preload: true,
    },
    [ResourceType.METAL]: {
      path: '/assets/3d/resources/metal/res_metal_ingot_01.glb',
      type: 'resource',
      preload: true,
    },
    [ResourceType.MINERALS]: {
      path: '/assets/3d/resources/minerals/res_mineral_crystal_01.glb',
      type: 'resource',
      preload: true,
    },
  },
  
  dice: {
    [DiceType.ALIEN_ATTACK]: {
      path: '/assets/3d/dice/alien_attack/dice_alien_attack.glb',
      type: 'dice',
      preload: false,
    },
    [DiceType.ALIEN_ACTION]: {
      path: '/assets/3d/dice/alien_action/dice_alien_action.glb',
      type: 'dice',
      preload: false,
    },
    [DiceType.HUMAN_D6]: {
      path: '/assets/3d/dice/human_d6/dice_human_d6.glb',
      type: 'dice',
      preload: false,
    },
    [DiceType.HUMAN_2D3]: {
      path: '/assets/3d/dice/human_2d3/dice_human_2d3.glb',
      type: 'dice',
      preload: false,
    },
    [DiceType.COMBAT]: {
      path: '/assets/3d/dice/combat/dice_combat.glb',
      type: 'dice',
      preload: false,
    },
  },
  
  vehicles: {
    mothership: {
      path: '/assets/3d/vehicles/mothership/veh_mothership_01.glb',
      type: 'vehicle',
      preload: true,
    },
    transport_boat: {
      path: '/assets/3d/vehicles/transport_boat/veh_transport_boat_01.glb',
      type: 'vehicle',
      preload: false,
    },
    floating_platform: {
      path: '/assets/3d/vehicles/floating_platform/veh_floating_platform_01.glb',
      type: 'vehicle',
      preload: false,
    },
  },
} as const;

// ============================================================================
// ASSET LOADER CLASS
// ============================================================================

export class AssetLoader {
  private loader: GLTFLoader;
  private loadingManager: THREE.LoadingManager;
  private dracoLoader: DRACOLoader;
  private cache: AssetCache = new Map();
  private loading: Map<string, Promise<THREE.Group>> = new Map();
  
  public onProgress?: (progress: LoadProgress) => void;
  public onComplete?: () => void;
  public onError?: (url: string, error: any) => void;
  
  constructor() {
    // Loading Manager
    this.loadingManager = new THREE.LoadingManager(
      () => {
        console.log('[AssetLoader] All assets loaded');
        this.onComplete?.();
      },
      (url: string, loaded: number, total: number) => {
        const progress: LoadProgress = {
          url,
          loaded,
          total,
          percentage: (loaded / total) * 100,
        };
        this.onProgress?.(progress);
      },
      (url: string) => {
        console.error('[AssetLoader] Error loading:', url);
        this.onError?.(url, new Error('Failed to load'));
      }
    );
    
    // GLTF Loader
    this.loader = new GLTFLoader(this.loadingManager);
    
    // Draco Loader (for compressed GLB)
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/'); // Host Draco decoder files
    this.loader.setDRACOLoader(this.dracoLoader);
  }
  
  /**
   * Load a single asset
   */
  async load(path: string): Promise<THREE.Group> {
    // Check cache
    if (this.cache.has(path)) {
      return this.cache.get(path)!.clone();
    }
    
    // Check if already loading
    if (this.loading.has(path)) {
      await this.loading.get(path);
      return this.cache.get(path)!.clone();
    }
    
    // Start loading
    const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.cache.set(path, gltf.scene);
          this.loading.delete(path);
          resolve(gltf.scene.clone());
        },
        undefined,
        (error) => {
          this.loading.delete(path);
          this.onError?.(path, error);
          reject(error);
        }
      );
    });
    
    this.loading.set(path, loadPromise);
    return loadPromise;
  }
  
  /**
   * Preload multiple assets
   */
  async preloadAll(paths: string[]): Promise<void> {
    console.log(`[AssetLoader] Preloading ${paths.length} assets...`);
    await Promise.all(paths.map(path => this.load(path)));
    console.log('[AssetLoader] Preload complete');
  }
  
  /**
   * Preload only priority assets (marked with preload: true)
   */
  async preloadPriority(): Promise<void> {
    const priorityPaths: string[] = [];
    
    // Collect all paths marked for preload
    Object.values(ASSET_REGISTRY).forEach((category) => {
      Object.values(category).forEach((asset: any) => {
        if (asset.preload) {
          priorityPaths.push(asset.path);
        }
      });
    });
    
    await this.preloadAll(priorityPaths);
  }
  
  /**
   * Get cached asset (without loading)
   */
  getCached(path: string): THREE.Group | null {
    return this.cache.get(path)?.clone() || null;
  }
  
  /**
   * Check if asset is cached
   */
  isCached(path: string): boolean {
    return this.cache.has(path);
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.forEach((asset) => {
      asset.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.cache.clear();
  }
  
  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      totalAssets: this.cache.size,
      loading: this.loading.size,
      paths: Array.from(this.cache.keys()),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let assetLoaderInstance: AssetLoader | null = null;

export function getAssetLoader(): AssetLoader {
  if (!assetLoaderInstance) {
    assetLoaderInstance = new AssetLoader();
  }
  return assetLoaderInstance;
}

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect } from 'react';

export function useAssetLoader() {
  const [loader] = useState(() => getAssetLoader());
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    loader.onProgress = setProgress;
    loader.onComplete = () => setIsComplete(true);
    
    return () => {
      loader.onProgress = undefined;
      loader.onComplete = undefined;
    };
  }, [loader]);
  
  return {
    loader,
    progress,
    isComplete,
    load: (path: string) => loader.load(path),
    preloadAll: (paths: string[]) => loader.preloadAll(paths),
    preloadPriority: () => loader.preloadPriority(),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get asset path by type and key
 */
export function getAssetPath(category: keyof typeof ASSET_REGISTRY, key: string): string {
  const asset = (ASSET_REGISTRY[category] as any)[key];
  if (!asset) {
    throw new Error(`Asset not found: ${category}.${key}`);
  }
  return asset.path;
}

/**
 * Load character model
 */
export async function loadCharacter(type: CharacterType): Promise<THREE.Group> {
  const loader = getAssetLoader();
  const path = getAssetPath('characters', type);
  return loader.load(path);
}

/**
 * Load resource model
 */
export async function loadResource(type: ResourceType): Promise<THREE.Group> {
  const loader = getAssetLoader();
  const path = getAssetPath('resources', type);
  return loader.load(path);
}

/**
 * Load dice model
 */
export async function loadDice(type: DiceType): Promise<THREE.Group> {
  const loader = getAssetLoader();
  const path = getAssetPath('dice', type);
  return loader.load(path);
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// 1. Basic usage with singleton
const loader = getAssetLoader();
const doctorModel = await loader.load('/assets/3d/characters/doctor/char_doctor_01.glb');
scene.add(doctorModel);

// 2. Preload priority assets at app start
await getAssetLoader().preloadPriority();

// 3. Use in React component
function MyComponent() {
  const { loader, progress, isComplete, preloadPriority } = useAssetLoader();
  
  useEffect(() => {
    preloadPriority();
  }, []);
  
  if (!isComplete) {
    return <div>Loading... {progress?.percentage.toFixed(0)}%</div>;
  }
  
  return <Canvas>...</Canvas>;
}

// 4. Helper functions
const doctor = await loadCharacter(CharacterType.DOCTOR);
const food = await loadResource(ResourceType.FOOD);
const dice = await loadDice(DiceType.ALIEN_ATTACK);
*/



