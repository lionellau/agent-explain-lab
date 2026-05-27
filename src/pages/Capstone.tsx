import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS, STORY } from '../chapters';
import Scene3D from '../three/Scene3D';
import { Brain, Orb, Beam, COLORS } from '../three/Prims';
import { Html } from '@react-three/drei';

const C = CHAPTERS[14];

const PIPELINE = [
  { name: 'Plan',     color: COLORS.agent,  pos: [-4.5, 1.5, 0] },
  { name: 'Memory',   color: COLORS.memory, pos: [-2.5, 2.0, 1.2] },
  { name: 'RAG',      color: COLORS.rag,    pos: [-0.5, 1.5, -1.2] },
  { name: 'Tools',    color: COLORS.tool,   pos: [1.5,  1.0, 1.0] },
  { name: 'Loop',     color: COLORS.warn,   pos: [3.0,  0.0, -0.6] },
  { name: 'Reflect',  color: COLORS.bad,    pos: [4.0, -1.2, 0.8] },
  { name: 'Write',    color: COLORS.good,   pos: [5.5, -2.0, 0] }
] as const;

const BEATS: Beat[] = [
  { caption: `Sam: "${STORY.ask}"`, readingMs: 3000,
    llmNote: 'Same request from the very first chapter. Watch every piece work together.' },
  { caption: 'The planner makes a list of 7 small tasks.', readingMs: 2800 },
  { caption: 'Memory recalls Sam\'s preferences from past trips.', readingMs: 2800 },
  { caption: 'RAG pulls the right paragraph from the insurance policy.', readingMs: 2800 },
  { caption: 'Tools fetch real prices: flights, hotels, weather.', readingMs: 2800 },
  { caption: 'The think-act loop refines the choices over two passes.', readingMs: 2800 },
  { caption: 'A critic catches a $35 overshoot and fixes it.', readingMs: 2800 },
  { caption: 'A grounded plan comes out the other side. That\'s the whole machine.', readingMs: 3400,
    llmNote: 'You now have a complete mental model of an agent.' }
];

function CapstoneScene({ step }: { step: number }) {
  const requestPos: [number, number, number] = [-6.5, 2.5, 0];

  return (
    <>
      {step >= 0 && <Orb position={requestPos} color={COLORS.user} label="Sam's request" />}

      {PIPELINE.map((p, i) => {
        const active = step >= i + 1;
        return (
          <Brain
            key={p.name}
            position={p.pos as [number, number, number]}
            color={p.color}
            size={active ? 0.55 : 0.4}
            label={active ? p.name : ''}
            dim={!active}
            spin={0.4 + i * 0.05}
          />
        );
      })}

      {/* Chain beams */}
      {step >= 1 && (
        <Beam from={requestPos} to={PIPELINE[0].pos as [number, number, number]} color={COLORS.user} />
      )}
      {PIPELINE.slice(0, -1).map((p, i) => {
        if (step < i + 2) return null;
        return (
          <Beam
            key={`b-${i}`}
            from={p.pos as [number, number, number]}
            to={PIPELINE[i + 1].pos as [number, number, number]}
            color={PIPELINE[i + 1].color}
          />
        );
      })}

      {step >= PIPELINE.length + 1 && (
        <Html position={[5.5, -3.5, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.good}`, borderRadius: 12,
            padding: '10px 14px', color: '#fdf6f0', fontSize: 11, lineHeight: 1.5, width: 280
          }}>
            <div style={{ color: COLORS.good, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Final plan</div>
            ✈️ Iberia JFK→LIS — $295<br />
            🏨 Hostel Alfama ×3 — $114<br />
            🚋 Tram 28 + Belém — $24<br />
            🥗 Veg lunches + café crawl — $34<br />
            <span style={{ color: COLORS.good, fontWeight: 700 }}>Total: $467 ✓ under $500</span>
          </div>
        </Html>
      )}
    </>
  );
}

export default function Capstone() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="Every piece of the lab in one continuous run. Watch the stages light up as the story moves through them."
      demo={
        <Scene3D
          height="500px"
          camera={{ position: [0, 2, 12], fov: 55 }}
          hint="Spin the pipeline · stages light up step by step"
        >
          <CapstoneScene step={step} />
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
      outro="🎉 That's the tour. Bookmark this page, share it with someone curious, and go build something."
    />
  );
}
