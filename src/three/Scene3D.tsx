import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  height?: string;
  camera?: { position: [number, number, number]; fov?: number };
  orbit?: boolean;
  stars?: boolean;
  hint?: string;
}

/**
 * Shared 3D canvas wrapper. The "no WebGL" fallback is only rendered
 * when the Canvas fails to mount a <canvas> element — so it never bleeds
 * through a working scene.
 */
export default function Scene3D({
  children,
  height = '420px',
  camera = { position: [0, 2, 10], fov: 50 },
  orbit = true,
  stars = true,
  hint = 'Drag to rotate · scroll to zoom'
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    // After mount + first paint, if there is no real <canvas> in the wrapper,
    // we assume WebGL failed.
    const t = window.setTimeout(() => {
      const cv = wrapRef.current?.querySelector('canvas');
      setWebglOk(Boolean(cv));
    }, 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={wrapRef} className="relative bg-ink-soft/60 border border-white/10 rounded-2xl overflow-hidden" style={{ height }}>
      {!webglOk && (
        <div className="absolute inset-0 flex items-center justify-center text-paper/50 text-sm text-center px-6 z-20 bg-ink-soft">
          Your browser couldn't start WebGL. Open this on a desktop browser with hardware acceleration.
        </div>
      )}
      <Canvas camera={camera} className="relative z-10" gl={{ alpha: false }}>
        <color attach="background" args={['#0f0f1e']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 8]} intensity={0.9} />
        <pointLight position={[-8, 4, 6]} intensity={0.6} color="#5cc8ff" />
        <pointLight position={[8, -2, -6]} intensity={0.5} color="#c084fc" />
        {stars && <Stars radius={40} depth={20} count={800} factor={2.5} fade speed={0.3} />}
        {children}
        {orbit && <OrbitControls enablePan={false} minDistance={5} maxDistance={22} />}
      </Canvas>
      <div className="absolute bottom-3 left-3 text-[11px] text-paper/40 pointer-events-none z-20">{hint}</div>
    </div>
  );
}
