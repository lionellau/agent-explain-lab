import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';
import Scene3D from '../three/Scene3D';
import { Brain, ToolNode, Beam, COLORS } from '../three/Prims';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

const C = CHAPTERS[8];

const TOOLS = [
  { label: 'Flights',  angle: 0   },
  { label: 'Hotels',   angle: 60  },
  { label: 'Calendar', angle: 120 },
  { label: 'Weather',  angle: 180 },
  { label: 'Email',    angle: 240 },
  { label: 'Maps',     angle: 300 }
];

const BEATS: Beat[] = [
  { caption: 'For the agent to actually do things, it has to plug into the outside world.', readingMs: 3200,
    llmNote: 'A "tool" is anything with an input and an output: an API, a database, a script.' },
  { caption: 'Without a standard, every tool needs its own custom cable.', readingMs: 3200,
    llmNote: 'Look at the spaghetti: 6 tools = 6 hand-built integrations. Each one breaks differently.' },
  { caption: 'MCP is one neat adapter that fits them all.', readingMs: 3200,
    llmNote: 'One golden hub in the middle, six clean lines out. New tool? It just plugs into the hub.' },
  { caption: 'Real life: things break. Tools time out. The agent has to handle it.', readingMs: 3400,
    llmNote: 'For high-stakes tools (payments, sends) the system pauses and asks for human approval first.' }
];

function McpHub({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.6; });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <torusGeometry args={[0.7, 0.18, 16, 48]} />
        <meshStandardMaterial color={COLORS.hub} emissive={COLORS.hub} emissiveIntensity={0.7} roughness={0.3} metalness={0.6} />
      </mesh>
      <Html position={[0, 1.0, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div style={{ color: COLORS.hub, fontSize: 11, fontWeight: 700, textShadow: '0 0 6px #0f0f1e', whiteSpace: 'nowrap' }}>
          🔌 MCP adapter
        </div>
      </Html>
    </group>
  );
}

function MCPScene({ step }: { step: number }) {
  const agentPos: [number, number, number] = [0, 2.8, 0];
  const hubPos:   [number, number, number] = [0, 0, 0];
  const radius = 3.6;
  const tools = TOOLS.map((t) => {
    const rad = (t.angle * Math.PI) / 180;
    const pos: [number, number, number] = [Math.cos(rad) * radius, -1.6, Math.sin(rad) * radius];
    return { ...t, pos };
  });
  const useMCP = step >= 2;
  const failedIdx = step >= 3 ? 4 : -1; // Email tool fails when step >= 3

  return (
    <>
      <Brain position={agentPos} color={COLORS.agent} size={0.9} label="Agent" />
      {useMCP && <McpHub position={hubPos} />}

      {tools.map((t, i) => (
        <ToolNode
          key={t.label}
          position={t.pos}
          color={i === failedIdx ? COLORS.bad : COLORS.tool}
          label={t.label}
          active={!useMCP || (useMCP && step >= 2 && i !== failedIdx)}
        />
      ))}

      {/* Beams */}
      {tools.map((t, i) => {
        if (!useMCP) {
          // Direct messy wires from agent to each tool
          return <Beam key={'d-' + t.label} from={agentPos} to={t.pos} color={i === failedIdx ? COLORS.bad : COLORS.tool} thick={1.2} dashed />;
        }
        // Two-segment: agent → hub → tool
        return (
          <group key={'mcp-' + t.label}>
            <Beam from={agentPos} to={hubPos} color={COLORS.hub} thick={1.8} />
            <Beam from={hubPos} to={t.pos} color={i === failedIdx ? COLORS.bad : COLORS.tool} thick={1.4} />
          </group>
        );
      })}

      {/* Failure callout */}
      {step >= 3 && (
        <Html position={tools[failedIdx].pos} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.bad}`, borderRadius: 10,
            padding: '8px 10px', color: '#fdf6f0', fontSize: 10, lineHeight: 1.3, width: 180, marginTop: 28
          }}>
            <div style={{ color: COLORS.bad, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>⚠ Failure</div>
            email.send needs human approval.
          </div>
        </Html>
      )}
    </>
  );
}

export default function ToolsMCP() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="A chatbot can only talk. An agent acts — but only because somebody wired tools into it. Watch what changes when there's a standard plug."
      demo={
        <Scene3D
          height="480px"
          camera={{ position: [0, 4, 11], fov: 50 }}
          hint="Rotate the room · count the cables before vs after"
        >
          <MCPScene step={step} />
        </Scene3D>
      }
      story={
        <StorySteps
          beats={BEATS}
          accent={C.accentText}
          accentBorder={C.accentBorder}
          accentBg={C.accentBg}
          onStep={setStep}
        />
      }
      outro="Next: even with all the right info, the agent's first draft might be wrong. How does it check itself?"
    />
  );
}
