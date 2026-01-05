/**
 * JORUMI - Game Scene (Three.js)
 * 
 * Componente principal de la escena 3D
 * 
 * PRINCIPIO CLAVE:
 * - La escena SOLO lee el estado del motor
 * - Los objetos 3D son representaciones visuales del GameState
 * - Las animaciones son REACTIVAS a cambios de estado
 * - NO hay lógica de juego aquí
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { GameBoard } from './GameBoard';
import { Lighting } from './Lighting';
import { LoadingScreen } from '../ui/LoadingScreen';

export function GameScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 12, 12],  // Más cerca y centrado
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,  // Más brillo
        }}
      >
        {/* Lighting */}
        <Lighting />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Grid de referencia */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
        />
        
        {/* Controles de cámara */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2} // No permitir rotar debajo del suelo
          minDistance={5}
          maxDistance={50}
        />
        
        {/* Game content (con Suspense para lazy loading) */}
        <Suspense fallback={<LoadingScreen />}>
          <GameBoard />
        </Suspense>
      </Canvas>
    </div>
  );
}



