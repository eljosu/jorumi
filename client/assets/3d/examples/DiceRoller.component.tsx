/**
 * JORUMI Dice Roller Component
 * 
 * Sistema completo de dados con física simulada y animaciones
 */

import { useGLTF } from '@react-three/drei';
import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DiceType, AlienAttackFace, AlienActionFace } from '../../../engine/domain/types';

// ============================================================================
// INTERFACES
// ============================================================================

interface DiceRollerProps {
  diceType: DiceType;
  onResult: (result: number | AlienAttackFace | AlienActionFace) => void;
  position?: [number, number, number];
  autoRoll?: boolean;
  rollDuration?: number;
}

interface DicePhysics {
  angularVelocity: THREE.Euler;
  velocity: THREE.Vector3;
  isRolling: boolean;
  startTime: number;
  duration: number;
}

// ============================================================================
// DICE PATHS
// ============================================================================

const DICE_PATHS: Record<DiceType, string> = {
  [DiceType.ALIEN_ATTACK]: '/assets/3d/dice/alien_attack/dice_alien_attack.glb',
  [DiceType.ALIEN_ACTION]: '/assets/3d/dice/alien_action/dice_alien_action.glb',
  [DiceType.HUMAN_D6]: '/assets/3d/dice/human_d6/dice_human_d6.glb',
  [DiceType.HUMAN_2D3]: '/assets/3d/dice/human_2d3/dice_human_2d3.glb',
  [DiceType.COMBAT]: '/assets/3d/dice/combat/dice_combat.glb',
};

// ============================================================================
// DICE RESULTS MAPPING
// ============================================================================

const ALIEN_ATTACK_FACES = [
  AlienAttackFace.SHIELD,
  AlienAttackFace.SHIELD,
  AlienAttackFace.CONTROL,
  AlienAttackFace.ATTACK,
  AlienAttackFace.ATTACK,
  AlienAttackFace.DOUBLE_ATTACK,
];

const ALIEN_ACTION_FACES = [
  AlienActionFace.MOVE,
  AlienActionFace.MOVE,
  AlienActionFace.SCAN,
  AlienActionFace.SCAN,
  AlienActionFace.BOMB,
  AlienActionFace.SPECIAL,
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DiceRoller({
  diceType,
  onResult,
  position = [0, 2, 0],
  autoRoll = false,
  rollDuration = 2.5,
}: DiceRollerProps) {
  const diceRef = useRef<THREE.Group>(null);
  const [physics, setPhysics] = useState<DicePhysics | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  
  // Load model
  const { scene } = useGLTF(DICE_PATHS[diceType]);
  
  // Roll function
  const roll = useCallback(() => {
    if (physics?.isRolling) return; // Already rolling
    
    const startAngularVelocity = new THREE.Euler(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    
    const startVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      4 + Math.random() * 2,
      (Math.random() - 0.5) * 3
    );
    
    setPhysics({
      angularVelocity: startAngularVelocity,
      velocity: startVelocity,
      isRolling: true,
      startTime: Date.now(),
      duration: rollDuration * 1000,
    });
    
    // Calculate result
    const result = calculateResult(diceType);
    setFinalResult(result);
    
    // Call result callback after duration
    setTimeout(() => {
      onResult(result);
      setPhysics(null);
    }, rollDuration * 1000);
  }, [diceType, onResult, physics, rollDuration]);
  
  // Auto-roll on mount if enabled
  useState(() => {
    if (autoRoll) {
      setTimeout(roll, 500);
    }
  });
  
  // Physics simulation
  useFrame((state, delta) => {
    if (!physics?.isRolling || !diceRef.current) return;
    
    const elapsed = Date.now() - physics.startTime;
    const progress = Math.min(elapsed / physics.duration, 1);
    
    // Easing for slowdown (exponential decay)
    const easing = Math.pow(1 - progress, 2);
    
    // Apply rotation
    diceRef.current.rotation.x += physics.angularVelocity.x * delta * easing;
    diceRef.current.rotation.y += physics.angularVelocity.y * delta * easing;
    diceRef.current.rotation.z += physics.angularVelocity.z * delta * easing;
    
    // Apply gravity
    physics.velocity.y -= 9.8 * delta;
    
    // Apply movement
    diceRef.current.position.x += physics.velocity.x * delta * easing;
    diceRef.current.position.y += physics.velocity.y * delta;
    diceRef.current.position.z += physics.velocity.z * delta * easing;
    
    // Ground collision
    if (diceRef.current.position.y < 0.01) {
      diceRef.current.position.y = 0.01;
      physics.velocity.y *= -0.4; // Bounce with damping
      
      // Ground friction
      physics.velocity.x *= 0.95;
      physics.velocity.z *= 0.95;
      
      // Angular damping on bounce
      physics.angularVelocity.x *= 0.8;
      physics.angularVelocity.y *= 0.8;
      physics.angularVelocity.z *= 0.8;
    }
    
    // Final settling
    if (progress > 0.9) {
      // Align to final face
      if (finalResult !== null) {
        alignToFace(diceRef.current, finalResult, progress);
      }
    }
  });
  
  return (
    <group position={position}>
      <group
        ref={diceRef}
        onClick={roll}
        onPointerOver={() => {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <primitive object={scene.clone()} castShadow receiveShadow />
        
        {/* Hover effect */}
        {isHovered && !physics?.isRolling && (
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" distance={0.5} />
        )}
      </group>
      
      {/* Ground shadow plane */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1, 1]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateResult(diceType: DiceType): any {
  const roll = Math.floor(Math.random() * 6);
  
  switch (diceType) {
    case DiceType.ALIEN_ATTACK:
      return ALIEN_ATTACK_FACES[roll];
    
    case DiceType.ALIEN_ACTION:
      return ALIEN_ACTION_FACES[roll];
    
    case DiceType.HUMAN_D6:
    case DiceType.COMBAT:
      return roll + 1; // 1-6
    
    case DiceType.HUMAN_2D3:
      // Roll two D3s
      const die1 = Math.floor(Math.random() * 3) + 1;
      const die2 = Math.floor(Math.random() * 3) + 1;
      return die1 + die2; // 2-6
    
    default:
      return roll + 1;
  }
}

function alignToFace(dice: THREE.Group, result: any, progress: number) {
  // This function would align the dice to show the correct face
  // For now, simplified - in production, map results to specific rotations
  
  const targetRotation = getFaceRotation(result);
  const alignStrength = (progress - 0.9) / 0.1; // 0 to 1 in final 10%
  
  dice.rotation.x = THREE.MathUtils.lerp(dice.rotation.x, targetRotation.x, alignStrength);
  dice.rotation.y = THREE.MathUtils.lerp(dice.rotation.y, targetRotation.y, alignStrength);
  dice.rotation.z = THREE.MathUtils.lerp(dice.rotation.z, targetRotation.z, alignStrength);
}

function getFaceRotation(result: any): THREE.Euler {
  // Map results to specific face-up rotations
  // This would need to be calibrated per actual dice model
  
  if (typeof result === 'number') {
    const rotations: Record<number, THREE.Euler> = {
      1: new THREE.Euler(0, 0, 0),
      2: new THREE.Euler(0, 0, Math.PI / 2),
      3: new THREE.Euler(0, 0, Math.PI),
      4: new THREE.Euler(0, 0, -Math.PI / 2),
      5: new THREE.Euler(Math.PI / 2, 0, 0),
      6: new THREE.Euler(-Math.PI / 2, 0, 0),
    };
    return rotations[result] || new THREE.Euler(0, 0, 0);
  }
  
  // For symbol dice, map to specific rotations based on face order
  return new THREE.Euler(0, 0, 0);
}

// ============================================================================
// MULTI-DICE ROLLER
// ============================================================================

interface MultiDiceRollerProps {
  diceTypes: DiceType[];
  onResults: (results: any[]) => void;
  spacing?: number;
}

export function MultiDiceRoller({ diceTypes, onResults, spacing = 0.3 }: MultiDiceRollerProps) {
  const [results, setResults] = useState<any[]>([]);
  
  const handleResult = (index: number, result: any) => {
    const newResults = [...results];
    newResults[index] = result;
    setResults(newResults);
    
    // Check if all dice have rolled
    if (newResults.filter(r => r !== undefined).length === diceTypes.length) {
      onResults(newResults);
    }
  };
  
  return (
    <group>
      {diceTypes.map((diceType, index) => (
        <DiceRoller
          key={index}
          diceType={diceType}
          position={[index * spacing, 2, 0]}
          onResult={(result) => handleResult(index, result)}
          autoRoll
          rollDuration={2 + Math.random() * 0.5} // Slight variation
        />
      ))}
    </group>
  );
}

// ============================================================================
// PRELOAD
// ============================================================================

export function preloadDice() {
  Object.values(DICE_PATHS).forEach(path => {
    useGLTF.preload(path);
  });
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// Single die
<DiceRoller
  diceType={DiceType.ALIEN_ATTACK}
  onResult={(result) => {
    console.log('Alien attack result:', result);
    // Handle game logic
  }}
  position={[0, 2, 0]}
/>

// Multiple dice
<MultiDiceRoller
  diceTypes={[DiceType.HUMAN_D6, DiceType.COMBAT]}
  onResults={(results) => {
    console.log('Combat roll:', results);
    // results[0] is D6 result
    // results[1] is combat die result
  }}
/>

// Interactive roller with UI
function CombatRoller() {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  
  return (
    <>
      <Canvas>
        {rolling && (
          <DiceRoller
            diceType={DiceType.COMBAT}
            onResult={(r) => {
              setResult(r);
              setRolling(false);
            }}
            autoRoll
          />
        )}
      </Canvas>
      
      <button onClick={() => setRolling(true)} disabled={rolling}>
        Roll Combat Die
      </button>
      
      {result && <div>Result: {result}</div>}
    </>
  );
}
*/


