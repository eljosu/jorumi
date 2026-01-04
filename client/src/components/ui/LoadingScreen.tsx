/**
 * Loading Screen mientras se cargan assets
 */

import { Html, useProgress } from '@react-three/drei';

export function LoadingScreen() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 p-8 bg-jorumi-dark bg-opacity-80 rounded-lg">
        <div className="text-white text-2xl font-bold">
          JORUMI
        </div>
        <div className="text-white text-lg">
          Loading... {progress.toFixed(0)}%
        </div>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-jorumi-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}


