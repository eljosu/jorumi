/**
 * JORUMI Game Board - React Three Fiber Example
 * 
 * Este es un ejemplo completo de cómo integrar el tablero de juego 3D
 * con todos los assets y el motor de juego.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Grid } from '@react-three/drei';
import { Suspense, useState } from 'react';
import * as THREE from 'three';
import { GameState, CharacterType, ResourceType, TileType } from '../../../engine/domain/types';

// ============================================================================
// SCENE SETUP
// ============================================================================

export function GameBoardScene() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [15, 15, 15], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        
        {/* Lighting */}
        <Lighting />
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />
        
        {/* Environment */}
        <Environment preset="dawn" />
        <fog attach="fog" args={['#1a1a2e', 20, 100]} />
        
        {/* Grid Helper */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
        />
        
        {/* Game Content */}
        <Suspense fallback={<LoadingIndicator />}>
          {gameState ? (
            <GameBoard gameState={gameState} />
          ) : (
            <DemoScene />
          )}
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <UIOverlay gameState={gameState} />
    </div>
  );
}

// ============================================================================
// LIGHTING
// ============================================================================

function Lighting() {
  return (
    <>
      {/* Ambient base */}
      <ambientLight intensity={0.3} color="#b0c4de" />
      
      {/* Main directional (sun) */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light */}
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#8090b0" />
      
      {/* Hemisphere (sky simulation) */}
      <hemisphereLight color="#87CEEB" groundColor="#2C3E50" intensity={0.4} />
      
      {/* Alien mothership ominous light */}
      <pointLight position={[0, 20, 0]} intensity={2} color="#39FF14" distance={30} decay={2} />
    </>
  );
}

// ============================================================================
// GAME BOARD
// ============================================================================

interface GameBoardProps {
  gameState: GameState;
}

function GameBoard({ gameState }: GameBoardProps) {
  return (
    <group>
      {/* Tiles */}
      {Array.from(gameState.tiles.values()).map((tile) => (
        <HexTile key={tile.id} tile={tile} />
      ))}
      
      {/* Characters */}
      {Array.from(gameState.characters.values()).map((character) => {
        const position = getCharacterPosition(character, gameState);
        return (
          <CharacterModel
            key={character.id}
            type={character.type}
            position={position}
            isWounded={character.isWounded}
            isUsed={character.isUsed}
          />
        );
      })}
      
      {/* Alien Mothership */}
      {gameState.alien.currentTileId && (
        <MothershipModel
          position={getTilePosition(gameState.alien.currentTileId, gameState)}
          health={gameState.alien.mothershipHealth}
          maxHealth={20}
          shield={gameState.alien.mothershipShield}
        />
      )}
      
      {/* Resources on map */}
      {Array.from(gameState.tiles.values()).map((tile) =>
        tile.resources ? (
          <group key={`resources-${tile.id}`}>
            {Object.entries(tile.resources).map(([type, amount]) =>
              amount && amount > 0 ? (
                <ResourceModel
                  key={`${tile.id}-${type}`}
                  type={type as ResourceType}
                  position={getTilePosition(tile.id, gameState)}
                  quantity={amount}
                />
              ) : null
            )}
          </group>
        ) : null
      )}
    </group>
  );
}

// ============================================================================
// DEMO SCENE (sin gameState)
// ============================================================================

function DemoScene() {
  return (
    <group>
      {/* Demo characters */}
      <CharacterModel type={CharacterType.DOCTOR} position={[0, 0, 0]} />
      <CharacterModel type={CharacterType.SOLDIER} position={[2, 0, 0]} />
      <CharacterModel type={CharacterType.PEASANT} position={[4, 0, 0]} />
      <CharacterModel type={CharacterType.CONSTRUCTOR} position={[6, 0, 0]} />
      <CharacterModel type={CharacterType.MINER} position={[8, 0, 0]} />
      
      {/* Demo resources */}
      <ResourceModel type={ResourceType.FOOD} position={[0, 0, 2]} quantity={3} />
      <ResourceModel type={ResourceType.MEDICINE} position={[2, 0, 2]} quantity={2} />
      <ResourceModel type={ResourceType.METAL} position={[4, 0, 2]} quantity={1} />
      <ResourceModel type={ResourceType.MINERALS} position={[6, 0, 2]} quantity={1} animate />
      
      {/* Demo mothership */}
      <MothershipModel position={[10, 8, 5]} health={20} maxHealth={20} shield={5} />
      
      {/* Demo vehicle */}
      <TransportBoatModel position={[-5, 0, 0]} />
    </group>
  );
}

// ============================================================================
// LOADING
// ============================================================================

function LoadingIndicator() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={0.5} />
    </mesh>
  );
}

// ============================================================================
// UI OVERLAY
// ============================================================================

interface UIOverlayProps {
  gameState: GameState | null;
}

function UIOverlay({ gameState }: UIOverlayProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
    }}>
      {/* Top HUD */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
      }}>
        {gameState ? (
          <>
            <div>Turno: {gameState.turn}</div>
            <div>Fase: {gameState.phase}</div>
            <div>Salud Nave: {gameState.alien.mothershipHealth}/20</div>
            <div>Escudo: {gameState.alien.mothershipShield}</div>
          </>
        ) : (
          <div>MODO DEMO</div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        pointerEvents: 'auto',
      }}>
        <button style={{ margin: '0 5px' }}>Rotar Vista</button>
        <button style={{ margin: '0 5px' }}>Centrar</button>
        <button style={{ margin: '0 5px' }}>Zoom ±</button>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCharacterPosition(character: any, gameState: GameState): [number, number, number] {
  // TODO: Implement based on hex coordinates
  return [0, 0, 0];
}

function getTilePosition(tileId: string, gameState: GameState): [number, number, number] {
  const tile = gameState.tiles.get(tileId);
  if (!tile) return [0, 0, 0];
  
  // Convert hex coordinates to world position
  const { q, r } = tile.coordinates;
  const x = q * 1.5;
  const z = r * Math.sqrt(3) + (q % 2) * (Math.sqrt(3) / 2);
  
  return [x, 0, z];
}

// ============================================================================
// COMPONENT STUBS (implement separately)
// ============================================================================

function CharacterModel(props: any) {
  return <mesh position={props.position}><boxGeometry args={[0.5, 1.75, 0.5]} /><meshStandardMaterial color="blue" /></mesh>;
}

function ResourceModel(props: any) {
  return <mesh position={props.position}><boxGeometry args={[0.3, 0.3, 0.3]} /><meshStandardMaterial color="green" /></mesh>;
}

function MothershipModel(props: any) {
  return <mesh position={props.position}><boxGeometry args={[5, 2, 8]} /><meshStandardMaterial color="purple" /></mesh>;
}

function TransportBoatModel(props: any) {
  return <mesh position={props.position}><boxGeometry args={[2, 0.5, 1]} /><meshStandardMaterial color="gray" /></mesh>;
}

function HexTile(props: any) {
  return <mesh position={getTilePosition(props.tile.id, {} as any)} rotation={[-Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.1, 6]} /><meshStandardMaterial color="#4a5568" /></mesh>;
}


