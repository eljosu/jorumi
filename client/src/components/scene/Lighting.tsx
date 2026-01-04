/**
 * JORUMI - Lighting Setup
 * 
 * Configuración de iluminación para la escena 3D
 */

export function Lighting() {
  return (
    <>
      {/* Luz ambiente base */}
      <ambientLight intensity={0.4} color="#b0c4de" />
      
      {/* Luz direccional principal (sol) */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light (suaviza sombras) */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#8090b0"
      />
      
      {/* Rim light (destaca siluetas) */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.4}
        color="#4a5d8a"
      />
      
      {/* Hemisphere light (simula cielo) */}
      <hemisphereLight
        color="#87CEEB"
        groundColor="#2C3E50"
        intensity={0.5}
      />
    </>
  );
}


