import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { Group, Mesh, MeshStandardMaterial } from 'three';

export const COLORS = {
  user:    '#fbbf24',
  agent:   '#c084fc',
  chatbot: '#94a3b8',
  tool:    '#38bdf8',
  rag:     '#34d399',
  memory:  '#f472b6',
  good:    '#4ade80',
  bad:     '#fb7185',
  warn:    '#fbbf24',
  hub:     '#fbbf24'
};

type Vec3 = [number, number, number];

interface BrainProps {
  position: Vec3;
  color: string;
  size?: number;
  label?: string;
  spin?: number;
  pulse?: boolean;
  dim?: boolean;
}

/** Glowing icosahedron with halo + optional rings. Looks like a "brain". */
export function Brain({ position, color, size = 1, label, spin = 0.4, pulse = true, dim = false }: BrainProps) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * spin;
    if (pulse && core.current) {
      const m = core.current.material as MeshStandardMaterial;
      const t = performance.now() * 0.003;
      m.emissiveIntensity = 0.45 + Math.sin(t) * 0.18;
    }
  });
  return (
    <group ref={group} position={position}>
      <mesh ref={core}>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={dim ? 0.15 : 0.5}
          roughness={0.3}
          metalness={0.35}
          flatShading
          transparent
          opacity={dim ? 0.5 : 1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.55, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.04 : 0.10} depthWrite={false} />
      </mesh>
      {label && (
        <Html position={[0, size + 0.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color,
              fontWeight: 600, fontSize: '12px',
              textShadow: '0 0 6px #0f0f1e, 0 0 2px #0f0f1e',
              whiteSpace: 'nowrap', userSelect: 'none'
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

interface ToolNodeProps {
  position: Vec3;
  color: string;
  label?: string;
  active?: boolean;
  size?: number;
}

/** Small cube tool icon with optional active glow. */
export function ToolNode({ position, color, label, active = false, size = 0.6 }: ToolNodeProps) {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
      ref.current.rotation.x += 0.002;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.9 : 0.2}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
      {label && (
        <Html position={[0, size * 0.95, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: active ? color : '#fdf6f0aa',
              fontWeight: active ? 700 : 500,
              fontSize: '11px',
              textShadow: '0 0 6px #0f0f1e',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

interface OrbProps {
  position: Vec3;
  color: string;
  size?: number;
  label?: string;
}

/** Small glowing orb (request, query, etc.). */
export function Orb({ position, color, size = 0.35, label }: OrbProps) {
  const ref = useRef<Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.02; });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[size, 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {label && (
        <Html position={[0, size + 0.3, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 600, textShadow: '0 0 6px #0f0f1e', whiteSpace: 'nowrap' }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

interface BeamProps {
  from: Vec3;
  to: Vec3;
  color: string;
  active?: boolean;
  thick?: number;
  dashed?: boolean;
}

/** Animated connecting line between two points. */
export function Beam({ from, to, color, active = true, thick = 2, dashed = false }: BeamProps) {
  // arc through a midpoint slightly raised so the line isn't dead-straight
  const mid: Vec3 = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.4,
    (from[2] + to[2]) / 2
  ];
  return (
    <Line
      points={[from, mid, to]}
      color={color}
      lineWidth={thick}
      transparent
      opacity={active ? 0.85 : 0.2}
      dashed={dashed}
      dashSize={0.18}
      gapSize={0.12}
    />
  );
}
