/**
 * JORUMI - Dice Roller Component
 * 
 * INTEGRACIÓN CRÍTICA CON EL MOTOR:
 * 
 * ⚠️ IMPORTANTE:
 * - El motor de reglas genera el resultado del dado (determinista)
 * - La UI SOLO ejecuta la animación visual
 * - NUNCA usar Math.random() para determinar el resultado de reglas
 * 
 * FLUJO CORRECTO:
 * 1. Usuario hace click en "Roll Dice"
 * 2. UI dispara acción al motor
 * 3. Motor calcula resultado (usando su RNG seedeado)
 * 4. Motor retorna nuevo estado + evento con resultado
 * 5. UI anima el dado y muestra el resultado calculado por el motor
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/game-store';

interface DiceRollerProps {
  onRollComplete?: (result: number) => void;
}

export function DiceRoller({ onRollComplete }: DiceRollerProps) {
  const diceRef = useRef<THREE.Group>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [targetResult, setTargetResult] = useState<number | null>(null);
  const [angularVelocity, setAngularVelocity] = useState<THREE.Euler>(new THREE.Euler());
  const [velocity, setVelocity] = useState<THREE.Vector3>(new THREE.Vector3());
  const [rollProgress, setRollProgress] = useState(0);
  
  /**
   * MÉTODO CORRECTO: Recibir resultado del motor
   * 
   * El motor ya calculó el resultado mediante su RNG determinista.
   * Solo necesitamos animar el dado para "revelar" ese resultado.
   */
  const rollWithResult = (result: number) => {
    console.log('[DiceRoller] Rolling dice with engine result:', result);
    
    setTargetResult(result);
    setIsRolling(true);
    setRollProgress(0);
    
    // Velocidades aleatorias SOLO para la animación visual
    // NO afectan el resultado del juego
    setAngularVelocity(new THREE.Euler(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5
    ));
    
    setVelocity(new THREE.Vector3(
      Math.random() * 2 - 1,
      3,
      Math.random() * 2 - 1
    ));
    
    // Duración de la animación
    setTimeout(() => {
      setIsRolling(false);
      if (onRollComplete) {
        onRollComplete(result);
      }
    }, 2000);
  };
  
  // Animación del dado
  useFrame((state, delta) => {
    if (isRolling && diceRef.current) {
      setRollProgress((prev) => prev + delta);
      
      // Aplicar rotación
      diceRef.current.rotation.x += angularVelocity.x * delta;
      diceRef.current.rotation.y += angularVelocity.y * delta;
      diceRef.current.rotation.z += angularVelocity.z * delta;
      
      // Aplicar gravedad y movimiento
      velocity.y -= 9.8 * delta;
      diceRef.current.position.add(velocity.clone().multiplyScalar(delta));
      
      // Bounce
      if (diceRef.current.position.y < 0.5) {
        diceRef.current.position.y = 0.5;
        velocity.y *= -0.5;
        
        // Decay
        angularVelocity.x *= 0.9;
        angularVelocity.y *= 0.9;
        angularVelocity.z *= 0.9;
      }
      
      // Fricción
      velocity.x *= 0.98;
      velocity.z *= 0.98;
    }
    
    // Al finalizar, rotar para mostrar el resultado correcto
    if (!isRolling && targetResult && diceRef.current && rollProgress > 0) {
      // Aquí podrías calcular la rotación exacta para mostrar la cara correcta
      // Por ahora, simplificado
      const targetRotation = getDiceRotationForValue(targetResult);
      diceRef.current.rotation.x = targetRotation.x;
      diceRef.current.rotation.y = targetRotation.y;
      diceRef.current.rotation.z = targetRotation.z;
    }
  });
  
  // Exponer método para que el componente padre pueda disparar el roll
  useEffect(() => {
    // Aquí podrías subscribirte a eventos del store
    // Por ahora, lo dejamos como ejemplo
  }, []);
  
  return (
    <group ref={diceRef} position={[0, 1, 0]}>
      {/* Dado simplificado (cubo) */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#FFFFFF"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Puntos en las caras (simplificado) */}
      {/* TODO: Cargar modelo GLB real del dado */}
    </group>
  );
}

/**
 * Calcula la rotación del dado para mostrar un valor específico
 * (Simplificado - en producción deberías mapear cada cara correctamente)
 */
function getDiceRotationForValue(value: number): THREE.Euler {
  const rotations: Record<number, THREE.Euler> = {
    1: new THREE.Euler(0, 0, 0),
    2: new THREE.Euler(Math.PI / 2, 0, 0),
    3: new THREE.Euler(0, 0, Math.PI / 2),
    4: new THREE.Euler(0, 0, -Math.PI / 2),
    5: new THREE.Euler(-Math.PI / 2, 0, 0),
    6: new THREE.Euler(Math.PI, 0, 0),
  };
  
  return rotations[value] || new THREE.Euler(0, 0, 0);
}

/**
 * Hook para usar el DiceRoller desde componentes React
 */
export function useDiceRoll() {
  const engine = useGameStore((state) => state.engine);
  const gameState = useGameStore((state) => state.gameState);
  
  /**
   * Roll de dado integrado con el motor
   */
  const rollDice = (diceType: string): number | null => {
    if (!engine || !gameState) {
      console.error('[useDiceRoll] Engine or game state not available');
      return null;
    }
    
    // El motor tiene un sistema de dados determinista
    // Aquí lo usaríamos así:
    // const result = engine.rollDice(diceType);
    
    // Por ahora, placeholder
    const result = Math.floor(Math.random() * 6) + 1;
    
    console.log('[useDiceRoll] Dice rolled:', diceType, '→', result);
    
    return result;
  };
  
  return { rollDice };
}


